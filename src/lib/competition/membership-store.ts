import {
  db,
  and,
  eq,
  inArray,
  isNull,
  lt,
  ne,
  or,
  Account,
  Collaborator,
  Participant,
  Project,
  Repository,
  Submission,
  Team,
  TeamMember,
} from 'astro:db'
import { randomUUID } from 'node:crypto'
import { lockTime } from './model'
import {
  canSwitch,
  planMembership,
  type MembershipAction,
  type MembershipState,
} from './membership'
import { tryTwice } from '../utils'
import { collaboratorsAt } from './team-status'

// Applies membership.ts to the database, on every push, sign-in and /account visit

type Batch = Parameters<typeof db.batch>[0]

// Records a competition repo and updates its team. `collaborators` is null
// when GitHub couldn't be asked, which keeps the stored ones
export async function recordRepository(input: {
  projectId: string
  githubRepoId: number
  fullName: string
  ownerGithubUserId: string
  collaborators: string[] | null
  now?: Date
}): Promise<{ repositoryId: string; teamId: string }> {
  const now = input.now ?? new Date()
  // Two deliveries can race to create a repo; the loser retries as existing
  for (let attempt = 1; ; attempt++) {
    const existing = await db
      .select()
      .from(Repository)
      .where(eq(Repository.githubRepoId, input.githubRepoId))
      .get()
    if (existing) {
      if (existing.fullName !== input.fullName) {
        await db
          .update(Repository)
          .set({ fullName: input.fullName })
          .where(eq(Repository.id, existing.id))
      }
      // A failure here mustn't lose the submission; the next push fixes it
      const error = await tryTwice(() =>
        refreshMembership(existing.id, input.collaborators, now),
      )
      if (error)
        console.error(
          `Couldn't update the team of ${input.fullName}, recording the submission anyway:`,
          error,
        )
      return { repositoryId: existing.id, teamId: existing.teamId }
    }

    try {
      const repositoryId = randomUUID()
      const state = await membershipState({
        projectId: input.projectId,
        repo: {
          repositoryId: null,
          teamId: null,
          ownerGithubUserId: input.ownerGithubUserId,
        },
        // The owner can always push
        freshCollaborators: input.collaborators ?? [input.ownerGithubUserId],
        now,
      })
      const teamId = await apply(
        input.projectId,
        repositoryId,
        planMembership(state),
        now,
        (teamId) =>
          db.insert(Repository).values({
            id: repositoryId,
            teamId,
            githubRepoId: input.githubRepoId,
            fullName: input.fullName,
          }),
      )
      return { repositoryId, teamId }
    } catch (error) {
      if (attempt >= 2) throw error
    }
  }
}

export async function projectOfRepository(
  githubRepoId: number,
): Promise<string | null> {
  const row = await db
    .select({ projectId: Team.projectId })
    .from(Repository)
    .innerJoin(Team, eq(Repository.teamId, Team.id))
    .where(eq(Repository.githubRepoId, githubRepoId))
    .get()
  return row?.projectId ?? null
}

export async function refreshMembership(
  repositoryId: string,
  collaborators: string[] | null,
  now = new Date(),
): Promise<void> {
  const repo = await db
    .select({ teamId: Repository.teamId, projectId: Team.projectId })
    .from(Repository)
    .innerJoin(Team, eq(Repository.teamId, Team.id))
    .where(eq(Repository.id, repositoryId))
    .get()
  if (!repo) throw new Error(`There's no repository ${repositoryId}`)

  const state = await membershipState({
    projectId: repo.projectId,
    repo: { repositoryId, teamId: repo.teamId, ownerGithubUserId: null },
    freshCollaborators: collaborators,
    now,
  })
  await apply(repo.projectId, repositoryId, planMembership(state), now)
}

// On sign-in, puts someone on the teams of repos they can push to
export async function syncUser(
  userId: string,
  now = new Date(),
): Promise<void> {
  const account = await db
    .select({ accountId: Account.accountId })
    .from(Account)
    .where(and(eq(Account.userId, userId), eq(Account.providerId, 'github')))
    .get()
  if (!account) return // only GitHub accounts can be on a team, as teams come from GitHub

  const rows = await db
    .select({ repositoryId: Collaborator.repositoryId })
    .from(Collaborator)
    .where(
      and(
        eq(Collaborator.githubUserId, account.accountId),
        isNull(Collaborator.removedAt),
      ),
    )
  for (const repositoryId of new Set(rows.map((r) => r.repositoryId))) {
    await refreshMembership(repositoryId, null, now)
  }
}

// Throws canSwitch's reason if they can't
export async function switchTeam(
  userId: string,
  projectId: string,
  teamId: string,
  now = new Date(),
): Promise<void> {
  const [project, team, account] = await Promise.all([
    db.select().from(Project).where(eq(Project.id, projectId)).get(),
    db.select().from(Team).where(eq(Team.id, teamId)).get(),
    db
      .select({ accountId: Account.accountId })
      .from(Account)
      .where(and(eq(Account.userId, userId), eq(Account.providerId, 'github')))
      .get(),
  ])
  if (!project || !team || team.projectId !== projectId)
    throw new Error("That team isn't in this competition")

  let participant = await db
    .select()
    .from(Participant)
    .where(
      and(eq(Participant.projectId, projectId), eq(Participant.userId, userId)),
    )
    .get()
  const member =
    participant &&
    (await db
      .select()
      .from(TeamMember)
      .where(eq(TeamMember.participantId, participant.id))
      .get())

  const canPush = account
    ? await db
        .select({ id: Collaborator.id })
        .from(Collaborator)
        .innerJoin(Repository, eq(Collaborator.repositoryId, Repository.id))
        .where(
          and(
            eq(Repository.teamId, teamId),
            eq(Collaborator.githubUserId, account.accountId),
            isNull(Collaborator.removedAt),
          ),
        )
        .get()
    : undefined

  const reason = canSwitch({
    now,
    lockAt: lockTime({
      ...project,
      endDate: project.endDate ?? null,
      teamsLockAt: project.teamsLockAt ?? null,
    }),
    currentTeamId: member?.teamId ?? null,
    targetTeamId: teamId,
    isCollaboratorOnTarget: !!canPush,
  })
  if (reason) throw new Error(reason)

  if (!participant) {
    participant = { id: randomUUID(), projectId, userId, joinedAt: now }
    await db.insert(Participant).values(participant)
  }
  if (member) {
    await db
      .update(TeamMember)
      .set({ teamId, joinedAt: now })
      .where(eq(TeamMember.id, member.id))
  } else {
    await db.insert(TeamMember).values({
      id: randomUUID(),
      participantId: participant.id,
      teamId,
      joinedAt: now,
    })
  }
}

// Moves a repo and its results to another team, e.g. to merge a second repo
export async function moveRepository(
  repositoryId: string,
  teamId: string,
): Promise<void> {
  const [repo, target] = await Promise.all([
    db
      .select({ projectId: Team.projectId })
      .from(Repository)
      .innerJoin(Team, eq(Repository.teamId, Team.id))
      .where(eq(Repository.id, repositoryId))
      .get(),
    db.select().from(Team).where(eq(Team.id, teamId)).get(),
  ])
  if (!repo || !target) throw new Error('No such repository or team')
  if (repo.projectId !== target.projectId)
    throw new Error('A repo can only move to a team in the same competition')
  await db
    .update(Repository)
    .set({ teamId })
    .where(eq(Repository.id, repositoryId))
}

// A commit already recorded for the repo is a duplicate, as GitHub redelivers
// webhooks. `id` keeps an existing id
export async function recordSubmission(input: {
  id?: string
  repositoryId: string
  commitHash: string
  score: number
  snapshotUrl: string | null
  submittedAt: Date
}): Promise<'recorded' | 'duplicate'> {
  const existing = () =>
    db
      .select({ id: Submission.id })
      .from(Submission)
      .where(
        and(
          eq(Submission.repositoryId, input.repositoryId),
          eq(Submission.commitHash, input.commitHash),
        ),
      )
      .get()
  if (await existing()) return 'duplicate'
  try {
    await db
      .insert(Submission)
      .values({ ...input, id: input.id ?? randomUUID() })
    return 'recorded'
  } catch (error) {
    // Another delivery recorded it in the meantime
    if (await existing()) return 'duplicate'
    throw error
  }
}

async function membershipState(input: {
  projectId: string
  repo: MembershipState['repo']
  freshCollaborators: string[] | null
  now: Date
}): Promise<MembershipState> {
  const { projectId, repo, freshCollaborators, now } = input
  const project = await db
    .select()
    .from(Project)
    .where(eq(Project.id, projectId))
    .get()
  if (!project) throw new Error(`There's no project ${projectId}`)
  const lockAt = lockTime({
    ...project,
    endDate: project.endDate ?? null,
    teamsLockAt: project.teamsLockAt ?? null,
  })

  const storedCollaborators = repo.repositoryId
    ? await db
        .select()
        .from(Collaborator)
        .where(eq(Collaborator.repositoryId, repo.repositoryId))
    : []

  const participants = await db
    .select({ userId: Participant.userId, teamId: TeamMember.teamId })
    .from(Participant)
    .leftJoin(TeamMember, eq(TeamMember.participantId, Participant.id))
    .where(eq(Participant.projectId, projectId))
  const teamOfUser = new Map(
    participants.map((p) => [p.userId, p.teamId ?? null]),
  )

  const githubIds = new Set([
    ...(freshCollaborators ?? []),
    ...storedCollaborators.map((c) => c.githubUserId),
    ...(repo.ownerGithubUserId ? [repo.ownerGithubUserId] : []),
  ])
  const memberUserIds = repo.teamId
    ? participants.filter((p) => p.teamId === repo.teamId).map((p) => p.userId)
    : []
  const accounts =
    githubIds.size || memberUserIds.length
      ? await db
          .select({ userId: Account.userId, accountId: Account.accountId })
          .from(Account)
          .where(
            and(
              eq(Account.providerId, 'github'),
              githubIds.size && memberUserIds.length
                ? orIn([...githubIds], memberUserIds)
                : githubIds.size
                  ? inArray(Account.accountId, [...githubIds])
                  : inArray(Account.userId, memberUserIds),
            ),
          )
      : []
  const userIdOfGithub = new Map(accounts.map((a) => [a.accountId, a.userId]))
  const githubOfUser = new Map(accounts.map((a) => [a.userId, a.accountId]))

  // Teams with a submission before the lock are locked
  const ownerUser = repo.ownerGithubUserId
    ? userIdOfGithub.get(repo.ownerGithubUserId)
    : undefined
  const candidateTeams = [
    repo.teamId,
    ownerUser ? teamOfUser.get(ownerUser) : null,
  ].filter((t): t is string => !!t)
  const teamsExistingAtLock = new Set<string>()
  if (lockAt && candidateTeams.length) {
    const early = await db
      .select({ teamId: Repository.teamId })
      .from(Submission)
      .innerJoin(Repository, eq(Submission.repositoryId, Repository.id))
      .where(
        and(
          inArray(Repository.teamId, candidateTeams),
          lt(Submission.submittedAt, lockAt),
        ),
      )
    for (const { teamId } of early) teamsExistingAtLock.add(teamId)
  }

  const otherRepoCollaborators = new Set<string>()
  if (repo.teamId) {
    const others = await db
      .select({
        githubUserId: Collaborator.githubUserId,
        addedAt: Collaborator.addedAt,
        removedAt: Collaborator.removedAt,
      })
      .from(Collaborator)
      .innerJoin(Repository, eq(Collaborator.repositoryId, Repository.id))
      .where(
        and(
          eq(Repository.teamId, repo.teamId),
          repo.repositoryId ? ne(Repository.id, repo.repositoryId) : undefined,
        ),
      )
    for (const c of collaboratorsAt(
      others.map((o) => ({ ...o, removedAt: o.removedAt ?? null })),
      now,
    )) {
      otherRepoCollaborators.add(c.githubUserId)
    }
  }

  return {
    now,
    lockAt,
    endAt: project.endDate ?? null,
    repo,
    freshCollaborators,
    storedCollaborators: storedCollaborators.map((c) => ({
      ...c,
      removedAt: c.removedAt ?? null,
    })),
    userIdOfGithub,
    teamOfUser,
    teamMembers: memberUserIds.map((userId) => ({
      userId,
      githubUserId: githubOfUser.get(userId) ?? null,
    })),
    otherRepoCollaborators,
    teamsExistingAtLock,
  }
}

const orIn = (githubIds: string[], userIds: string[]) => {
  const byGithub = inArray(Account.accountId, githubIds)
  const byUser = inArray(Account.userId, userIds)
  return byGithub && byUser ? or(byGithub, byUser) : undefined
}

// Writes the decisions in one batch, so a repo is never half recorded.
// Returns the repo's team
async function apply(
  projectId: string,
  repositoryId: string,
  actions: MembershipAction[],
  now: Date,
  createRepository?: (teamId: string) => Batch[number],
): Promise<string> {
  const queries: Batch[number][] = []
  let teamId = ''
  const participantIds = new Map<string, string>()

  const participantOf = async (userId: string) => {
    if (!participantIds.has(userId)) {
      const row = await db
        .select({ id: Participant.id })
        .from(Participant)
        .where(
          and(
            eq(Participant.projectId, projectId),
            eq(Participant.userId, userId),
          ),
        )
        .get()
      if (row) participantIds.set(userId, row.id)
    }
    return participantIds.get(userId)!
  }

  for (const action of actions) {
    switch (action.kind) {
      case 'useTeam':
        teamId = action.teamId
        if (createRepository) queries.push(createRepository(teamId))
        break
      case 'newTeam':
        teamId = randomUUID()
        queries.push(db.insert(Team).values({ id: teamId, projectId }))
        if (createRepository) queries.push(createRepository(teamId))
        break
      case 'addCollaborator':
        queries.push(
          db.insert(Collaborator).values({
            id: randomUUID(),
            repositoryId,
            githubUserId: action.githubUserId,
            addedAt: now,
          }),
        )
        break
      case 'removeCollaborator':
      case 'restoreCollaborator':
        queries.push(
          db
            .update(Collaborator)
            .set({
              removedAt: action.kind === 'removeCollaborator' ? now : null,
            })
            .where(
              and(
                eq(Collaborator.repositoryId, repositoryId),
                eq(Collaborator.githubUserId, action.githubUserId),
              ),
            ),
        )
        break
      case 'createParticipant': {
        const id = randomUUID()
        participantIds.set(action.userId, id)
        queries.push(
          db
            .insert(Participant)
            .values({ id, projectId, userId: action.userId, joinedAt: now }),
        )
        break
      }
      case 'joinTeam':
        queries.push(
          db.insert(TeamMember).values({
            id: randomUUID(),
            participantId: await participantOf(action.userId),
            teamId,
            joinedAt: now,
          }),
        )
        break
      case 'leaveTeam':
        queries.push(
          db
            .delete(TeamMember)
            .where(
              eq(TeamMember.participantId, await participantOf(action.userId)),
            ),
        )
        break
    }
  }

  const [first, ...rest] = queries
  if (first) await db.batch([first, ...rest])
  return teamId
}
