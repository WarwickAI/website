import type { CompetitionData, PenaltyRow } from './model'

// Builders for CompetitionData in tests. Ids are readable, so failures are too

export const START = new Date('2026-10-13T16:00:00Z')
export const END = new Date('2026-12-08T17:00:00Z')

// An empty poker-like competition: start 13 Oct, end 8 Dec, no lock
export function competition(
  project: Partial<CompetitionData['project']> = {},
): CompetitionData {
  return {
    project: {
      id: 'poker',
      name: 'Poker',
      templateRepo: 'WarwickAI/poker-comp',
      startDate: START,
      endDate: END,
      teamsLockAt: null,
      ...project,
    },
    teams: [],
    participants: [],
    teamMembers: [],
    users: [],
    githubUserIdOf: new Map(),
    userIdOfGithub: new Map(),
    repositories: [],
    collaborators: [],
    submissions: [],
    rounds: [],
    roundResults: [],
    penalties: [],
  }
}

// A signed-in user with a GitHub account. Returns their user id, `user-<name>`
export function user(
  data: CompetitionData,
  name: string,
  githubUserId = `gh-${name}`,
): string {
  const id = `user-${name}`
  data.users.push({ id, name, image: null })
  data.githubUserIdOf.set(id, githubUserId)
  data.userIdOfGithub.set(githubUserId, id)
  return id
}

// The user's Participant in this competition, created if needed. Returns its id
export function participant(data: CompetitionData, userId: string): string {
  const id = `p-${userId}`
  if (!data.participants.some((p) => p.id === id)) {
    data.participants.push({ id, userId, joinedAt: data.project.startDate })
  }
  return id
}

type CollaboratorSpec =
  string | { githubUserId: string; addedAt?: Date; removedAt?: Date | null }

// A team with members (user ids) and repos, whose collaborators are GitHub ids
export function team(
  data: CompetitionData,
  id: string,
  opts: {
    members?: string[]
    repos?: {
      id: string
      fullName?: string
      githubRepoId?: number | null
      collaborators?: CollaboratorSpec[]
    }[]
  } = {},
): void {
  data.teams.push({ id })
  for (const userId of opts.members ?? []) {
    const participantId = participant(data, userId)
    data.teamMembers.push({
      id: `tm-${participantId}`,
      participantId,
      teamId: id,
      joinedAt: data.project.startDate,
    })
  }
  for (const repo of opts.repos ?? []) {
    data.repositories.push({
      id: repo.id,
      teamId: id,
      githubRepoId:
        repo.githubRepoId === undefined
          ? data.repositories.length + 1
          : repo.githubRepoId,
      fullName: repo.fullName ?? `${id}/${repo.id}`,
    })
    for (const spec of repo.collaborators ?? []) {
      const c = typeof spec === 'string' ? { githubUserId: spec } : spec
      data.collaborators.push({
        id: `c-${repo.id}-${c.githubUserId}`,
        repositoryId: repo.id,
        githubUserId: c.githubUserId,
        addedAt: c.addedAt ?? data.project.startDate,
        removedAt: c.removedAt ?? null,
      })
    }
  }
}

export function submission(
  data: CompetitionData,
  s: {
    id: string
    repositoryId: string
    score: number
    submittedAt: Date
    commitHash?: string
  },
): void {
  data.submissions.push({ snapshotUrl: null, commitHash: s.id, ...s })
}

export function round(
  data: CompetitionData,
  r: { id: string; number: number; playedAt: Date },
): void {
  data.rounds.push(r)
}

export function result(
  data: CompetitionData,
  r: { roundId: string; submissionId: string; place: number; points: number },
): void {
  data.roundResults.push({ id: `rr-${r.roundId}-${r.submissionId}`, ...r })
}

export function penalty(
  data: CompetitionData,
  p: Partial<PenaltyRow> & Pick<PenaltyRow, 'kind'>,
): void {
  data.penalties.push({
    id: `pen-${data.penalties.length + 1}`,
    teamId: null,
    participantId: null,
    points: null,
    beforeRound: null,
    reason: 'test',
    publicNote: null,
    createdAt: data.project.startDate,
    liftedAt: null,
    ...p,
  })
}

// A date a given number of days after the start
export function day(n: number): Date {
  return new Date(START.getTime() + n * 24 * 60 * 60 * 1000)
}
