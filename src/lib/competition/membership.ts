import { lockTime, type CompetitionData } from './model'
import { collaboratorsAt, type TeamState, type TeamStatus } from './team-status'

// One repo and the people around it, as membership-store.ts reads them
export interface MembershipState {
  now: Date
  lockAt: Date | null
  // After this, teams that existed at the lock never change
  endAt: Date | null
  // Ids are null for a repo we haven't seen before
  repo: {
    repositoryId: string | null
    teamId: string | null
    ownerGithubUserId: string | null
  }
  // From GitHub, or null to keep the stored list
  freshCollaborators: string[] | null
  storedCollaborators: {
    githubUserId: string
    addedAt: Date
    removedAt: Date | null
  }[]
  userIdOfGithub: Map<string, string>
  // Each participant's team, or null
  teamOfUser: Map<string, string | null>
  teamMembers: { userId: string; githubUserId: string | null }[]
  otherRepoCollaborators: Set<string>
  teamsExistingAtLock: Set<string>
}

export type MembershipAction =
  | { kind: 'useTeam'; teamId: string }
  | { kind: 'newTeam' }
  | { kind: 'addCollaborator'; githubUserId: string }
  | { kind: 'removeCollaborator'; githubUserId: string }
  | { kind: 'restoreCollaborator'; githubUserId: string }
  | { kind: 'createParticipant'; userId: string }
  | { kind: 'joinTeam'; userId: string }
  | { kind: 'leaveTeam'; userId: string }

// What changes for one repo:
// - a new repo joins its owner's team, or starts one
// - signed-in collaborators on no team join it; nobody is moved off a team
// - members who can't push to any of its repos leave
// - after the lock, only people who could push before it can still join
export function planMembership(state: MembershipState): MembershipAction[] {
  const {
    now,
    lockAt,
    repo,
    freshCollaborators,
    storedCollaborators,
    userIdOfGithub,
    teamOfUser,
  } = state
  const actions: MembershipAction[] = []

  let teamId = repo.teamId
  if (!repo.repositoryId) {
    const owner =
      repo.ownerGithubUserId && userIdOfGithub.get(repo.ownerGithubUserId)
    teamId = (owner && teamOfUser.get(owner)) || null
  }
  actions.push(teamId ? { kind: 'useTeam', teamId } : { kind: 'newTeam' })

  const stored = new Map(storedCollaborators.map((c) => [c.githubUserId, c]))
  let current: string[]
  if (freshCollaborators) {
    for (const githubUserId of freshCollaborators) {
      const row = stored.get(githubUserId)
      if (!row) actions.push({ kind: 'addCollaborator', githubUserId })
      else if (row.removedAt)
        actions.push({ kind: 'restoreCollaborator', githubUserId })
    }
    const fresh = new Set(freshCollaborators)
    for (const row of storedCollaborators) {
      if (!row.removedAt && !fresh.has(row.githubUserId)) {
        actions.push({
          kind: 'removeCollaborator',
          githubUserId: row.githubUserId,
        })
      }
    }
    current = freshCollaborators
  } else {
    current = collaboratorsAt(storedCollaborators, now).map(
      (c) => c.githubUserId,
    )
  }

  const locked = !!lockAt && now >= lockAt
  const ended = !!state.endAt && now > state.endAt
  const teamIsLocked =
    locked && !!teamId && state.teamsExistingAtLock.has(teamId)
  for (const githubUserId of current) {
    const userId = userIdOfGithub.get(githubUserId)
    if (!userId) continue
    if (!teamOfUser.has(userId))
      actions.push({ kind: 'createParticipant', userId })
    if (teamOfUser.get(userId)) continue

    const addedAt = stored.get(githubUserId)?.addedAt
    const couldPushBeforeLock = !!lockAt && !!addedAt && addedAt < lockAt
    if (!teamIsLocked || (couldPushBeforeLock && !ended))
      actions.push({ kind: 'joinTeam', userId })
  }

  if (!locked && repo.teamId) {
    const canPush = new Set([...current, ...state.otherRepoCollaborators])
    for (const member of state.teamMembers) {
      if (member.githubUserId && !canPush.has(member.githubUserId)) {
        actions.push({ kind: 'leaveTeam', userId: member.userId })
      }
    }
  }

  return actions
}

// Why someone can't switch teams, or null
export function canSwitch(s: {
  now: Date
  lockAt: Date | null
  currentTeamId: string | null
  targetTeamId: string
  isCollaboratorOnTarget: boolean
}): string | null {
  if (s.lockAt && s.now >= s.lockAt)
    return `Teams locked on ${s.lockAt.toUTCString()}`
  if (s.currentTeamId === s.targetTeamId) return "You're already on this team"
  if (!s.isCollaboratorOnTarget)
    return 'You need to be a collaborator on one of its repositories first'
  return null
}

// Other teams someone can push to, until teams lock
export function switchOffers(
  data: CompetitionData,
  userId: string,
  now: Date,
): { teamId: string; repoFullName: string }[] {
  const lockAt = lockTime(data.project)
  const githubUserId = data.githubUserIdOf.get(userId)
  if ((lockAt && now >= lockAt) || !githubUserId) return []

  const participant = data.participants.find((p) => p.userId === userId)
  const myTeam =
    participant &&
    data.teamMembers.find((m) => m.participantId === participant.id)?.teamId
  const canPush = new Set(
    collaboratorsAt(data.collaborators, now)
      .filter((c) => c.githubUserId === githubUserId)
      .map((c) => c.repositoryId),
  )

  const offers = new Map<string, string>()
  for (const repo of data.repositories) {
    if (
      canPush.has(repo.id) &&
      repo.teamId !== myTeam &&
      !offers.has(repo.teamId)
    ) {
      offers.set(repo.teamId, repo.fullName)
    }
  }
  return [...offers].map(([teamId, repoFullName]) => ({ teamId, repoFullName }))
}

// Someone's place in one competition, for /account and the account popover
export interface MyTeam {
  projectId: string
  projectName: string
  templateRepo: string
  locked: boolean
  teamId: string | null
  // The repo that plays
  repoFullName: string | null
  members: { name: string; image: string | null }[]
  state: TeamState | null
  // People on other teams who can push to its repo
  holdReasons: { name: string; otherRepoFullName: string }[]
  unclaimedGithubUserIds: string[]
  switchOffers: { teamId: string; repoFullName: string }[]
}

export function summariseMyTeam(
  data: CompetitionData,
  statuses: Map<string, TeamStatus>,
  userId: string,
  now: Date,
): MyTeam {
  const lockAt = lockTime(data.project)
  const participant = data.participants.find((p) => p.userId === userId)
  const teamId =
    (participant &&
      data.teamMembers.find((m) => m.participantId === participant.id)
        ?.teamId) ??
    null
  const status = teamId ? statuses.get(teamId) : undefined
  const users = new Map(data.users.map((u) => [u.id, u]))
  const repoName = (repositoryId: string | null | undefined) =>
    data.repositories.find((r) => r.id === repositoryId)?.fullName ?? null
  const newestRepoOf = (team: string) =>
    statuses.get(team)?.newestRepositoryId ??
    data.repositories.find((r) => r.teamId === team)?.id

  return {
    projectId: data.project.id,
    projectName: data.project.name,
    templateRepo: data.project.templateRepo,
    locked: !!lockAt && now >= lockAt,
    teamId,
    repoFullName: teamId ? repoName(newestRepoOf(teamId)) : null,
    members: (status?.memberUserIds ?? []).map((id) => ({
      name: users.get(id)?.name ?? 'Anonymous',
      image: users.get(id)?.image ?? null,
    })),
    state: status?.state ?? null,
    holdReasons: (status?.holdReasons ?? []).map((reason) => ({
      name:
        users.get(data.userIdOfGithub.get(reason.githubUserId) ?? '')?.name ??
        reason.githubUserId,
      otherRepoFullName:
        repoName(newestRepoOf(reason.otherTeamId)) ?? 'another team',
    })),
    unclaimedGithubUserIds: status?.newestRepositoryId
      ? collaboratorsAt(
          data.collaborators.filter(
            (c) => c.repositoryId === status.newestRepositoryId,
          ),
          now,
        )
          .map((c) => c.githubUserId)
          .filter((id) => !data.userIdOfGithub.has(id))
      : [],
    switchOffers: switchOffers(data, userId, now),
  }
}

// A switch to answer, a hold to sort out, or teammates to sign in
export function needsAttention(team: MyTeam): boolean {
  return (
    team.switchOffers.length > 0 ||
    team.state === 'onHold' ||
    team.unclaimedGithubUserIds.length > 0
  )
}

// Whether the team can't play until it's sorted out (shown in red)
export function stopsPlay(team: MyTeam): boolean {
  return team.state === 'onHold'
}

// What needs doing, for the account popover
export function attentionLine(team: MyTeam): string | null {
  if (team.state === 'onHold')
    return 'On hold: someone on another team can push to your repository'
  if (team.switchOffers.length)
    return `You can switch to ${team.switchOffers[0].repoFullName}`
  const unclaimed = team.unclaimedGithubUserIds.length
  if (unclaimed)
    return `${unclaimed} teammate${unclaimed === 1 ? " hasn't" : "s haven't"} signed in`
  return null
}

// Coding assistants that show up as commit authors, never teammates
const ASSISTANTS = new Set(['claude'])

// People with commits who can't push to the repo, to suggest as collaborators.
// The template's authors are left out, as copies of it credit them
export function commitAuthorsToSuggest(
  contributors: { id?: number; login?: string; type?: string }[],
  collaborators: Set<string>,
  templateAuthors: Set<string>,
): { githubUserId: string; login: string }[] {
  return contributors
    .filter(
      (c) =>
        c.id &&
        c.login &&
        c.type === 'User' &&
        !ASSISTANTS.has(c.login.toLowerCase()),
    )
    .map((c) => ({ githubUserId: String(c.id), login: c.login! }))
    .filter(
      (c) =>
        !collaborators.has(c.githubUserId) &&
        !templateAuthors.has(c.githubUserId),
    )
}
