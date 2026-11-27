import type { CompetitionData, PenaltyRow } from './model'

// - onHold: someone on another team can push to it, so it can't play or rank
// - unclaimed: nobody on it has signed in
// - left: its people are on other teams, so it isn't shown
export type TeamState =
  'active' | 'onHold' | 'unclaimed' | 'left' | 'dsq' | 'hidden'

export interface TeamStatus {
  teamId: string
  state: TeamState
  memberUserIds: string[]
  // The repo that plays: the one with the latest submission
  newestRepositoryId: string | null
  unclaimedCount: number
  holdReasons: { githubUserId: string; otherTeamId: string }[]
  ineligible: boolean
  pointsPenalty: number
  voidBeforeRound: number | null
  publicNotes: string[]
}

// The collaborator rows that had access at `at`
export function collaboratorsAt<
  T extends { addedAt: Date; removedAt: Date | null },
>(rows: T[], at: Date): T[] {
  return rows.filter(
    (c) => c.addedAt <= at && (c.removedAt === null || c.removedAt > at),
  )
}

export function teamStatuses(
  data: CompetitionData,
  now: Date,
): Map<string, TeamStatus> {
  const { project } = data
  // After the end, standings don't change
  const holdAt =
    project.endDate && now > project.endDate ? project.endDate : now

  const userOfParticipant = new Map(
    data.participants.map((p) => [p.id, p.userId]),
  )
  const teamOfUser = new Map<string, string>()
  const membersOf = new Map<
    string,
    { participantId: string; userId: string }[]
  >()
  for (const member of data.teamMembers) {
    const userId = userOfParticipant.get(member.participantId)
    if (!userId) continue
    teamOfUser.set(userId, member.teamId)
    membersOf.set(member.teamId, [
      ...(membersOf.get(member.teamId) ?? []),
      { participantId: member.participantId, userId },
    ])
  }

  const latestSubmission = new Map<string, number>()
  for (const s of data.submissions) {
    latestSubmission.set(
      s.repositoryId,
      Math.max(
        latestSubmission.get(s.repositoryId) ?? 0,
        s.submittedAt.getTime(),
      ),
    )
  }

  const statuses = new Map<string, TeamStatus>()
  for (const { id: teamId } of data.teams) {
    const members = membersOf.get(teamId) ?? []
    const repos = data.repositories.filter((r) => r.teamId === teamId)
    const repoIds = new Set(repos.map((r) => r.id))
    const collaborators = data.collaborators.filter((c) =>
      repoIds.has(c.repositoryId),
    )

    const newest = [...repos].sort(
      (a, b) =>
        (latestSubmission.get(b.id) ?? 0) - (latestSubmission.get(a.id) ?? 0),
    )[0]
    const unclaimedCount = newest
      ? collaboratorsAt(
          collaborators.filter((c) => c.repositoryId === newest.id),
          now,
        ).filter((c) => !data.userIdOfGithub.has(c.githubUserId)).length
      : 0

    // Signed-in people on other teams who can push here
    const onOtherTeams = (at: Date) => {
      const reasons = new Map<string, string>()
      for (const c of collaboratorsAt(collaborators, at)) {
        const userId = data.userIdOfGithub.get(c.githubUserId)
        const otherTeamId = userId && teamOfUser.get(userId)
        if (otherTeamId && otherTeamId !== teamId)
          reasons.set(c.githubUserId, otherTeamId)
      }
      return [...reasons].map(([githubUserId, otherTeamId]) => ({
        githubUserId,
        otherTeamId,
      }))
    }

    const memberParticipants = new Set(members.map((m) => m.participantId))
    const active = data.penalties.filter(
      (p: PenaltyRow) =>
        p.liftedAt === null &&
        (p.teamId === teamId ||
          (p.participantId !== null &&
            memberParticipants.has(p.participantId))),
    )
    const has = (kind: PenaltyRow['kind']) =>
      active.some((p) => p.kind === kind)
    const voids = active
      .filter((p) => p.kind === 'void' && p.beforeRound !== null)
      .map((p) => p.beforeRound!)

    const holdReasons = members.length ? onOtherTeams(holdAt) : []
    let state: TeamState
    if (has('hidden')) state = 'hidden'
    else if (has('dsq')) state = 'dsq'
    else if (!members.length)
      state = onOtherTeams(now).length ? 'left' : 'unclaimed'
    else if (holdReasons.length) state = 'onHold'
    else state = 'active'

    statuses.set(teamId, {
      teamId,
      state,
      memberUserIds: members.map((m) => m.userId),
      newestRepositoryId: newest?.id ?? null,
      unclaimedCount,
      holdReasons,
      ineligible: has('ineligible'),
      pointsPenalty: active
        .filter((p) => p.kind === 'points')
        .reduce((sum, p) => sum + (p.points ?? 0), 0),
      voidBeforeRound: voids.length ? Math.max(...voids) : null,
      publicNotes: active
        .map((p) => p.publicNote)
        .filter((n): n is string => !!n),
    })
  }
  return statuses
}
