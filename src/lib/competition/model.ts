// What the competition logic works on, loaded by data.ts

export type PenaltyKind = 'dsq' | 'hidden' | 'void' | 'points' | 'ineligible'

export const PENALTY_KINDS: readonly PenaltyKind[] = [
  'dsq',
  'hidden',
  'void',
  'points',
  'ineligible',
]

// Points and voided rounds only make sense for a team
export const PERSON_PENALTY_KINDS: readonly PenaltyKind[] = [
  'dsq',
  'hidden',
  'ineligible',
]

export interface PenaltyRow {
  id: string
  teamId: string | null
  participantId: string | null
  kind: PenaltyKind
  points: number | null
  beforeRound: number | null
  reason: string
  publicNote: string | null
  createdAt: Date
  liftedAt: Date | null
}

export interface CompetitionData {
  project: {
    id: string
    name: string
    templateRepo: string
    startDate: Date
    endDate: Date | null
    teamsLockAt: Date | null
  }
  teams: { id: string }[]
  participants: { id: string; userId: string; joinedAt: Date }[]
  teamMembers: {
    id: string
    participantId: string
    teamId: string
    joinedAt: Date
  }[]
  // Participants, and collaborators who have signed in
  users: { id: string; name: string; image: string | null }[]
  // From each user's GitHub Account, both ways round
  githubUserIdOf: Map<string, string>
  userIdOfGithub: Map<string, string>
  repositories: {
    id: string
    teamId: string
    githubRepoId: number | null
    fullName: string
  }[]
  collaborators: {
    id: string
    repositoryId: string
    githubUserId: string
    addedAt: Date
    removedAt: Date | null
  }[]
  submissions: {
    id: string
    repositoryId: string
    commitHash: string
    score: number
    snapshotUrl: string | null
    submittedAt: Date
  }[]
  rounds: { id: string; number: number; playedAt: Date }[]
  roundResults: {
    id: string
    roundId: string
    submissionId: string
    place: number
    points: number
  }[]
  penalties: PenaltyRow[]
}

// When a competition's teams lock: its own lock date, or its end, or never
export function lockTime(project: CompetitionData['project']): Date | null {
  return project.teamsLockAt ?? project.endDate ?? null
}

export interface NewPenalty {
  teamId?: string
  participantId?: string
  kind: string
  points?: number
  beforeRound?: number
  reason: string
  publicNote?: string
}

// What's wrong with a penalty, as the database can't check these itself
export function validatePenalty(penalty: NewPenalty): string[] {
  const problems: string[] = []
  const { teamId, participantId, kind, points, beforeRound, reason } = penalty

  if (!teamId && !participantId) {
    problems.push('A penalty needs a team or a participant')
  } else if (teamId && participantId) {
    problems.push('A penalty names a team or a participant, not both')
  }

  if (!PENALTY_KINDS.includes(kind as PenaltyKind)) {
    problems.push(
      `${kind} isn't a kind of penalty, use one of: ${PENALTY_KINDS.join(', ')}`,
    )
  } else if (
    participantId &&
    !teamId &&
    !PERSON_PENALTY_KINDS.includes(kind as PenaltyKind)
  ) {
    problems.push(
      `A person can only get one of: ${PERSON_PENALTY_KINDS.join(', ')}`,
    )
  }

  if (kind === 'points') {
    if (points === undefined || !(points > 0))
      problems.push('A points penalty needs a positive number of points')
  } else if (points !== undefined) {
    problems.push('Only a points penalty has points')
  }

  if (kind === 'void') {
    if (
      beforeRound === undefined ||
      !Number.isInteger(beforeRound) ||
      beforeRound < 2
    ) {
      problems.push(
        'A void penalty needs beforeRound, a whole round number of at least 2',
      )
    }
  } else if (beforeRound !== undefined) {
    problems.push('Only a void penalty has beforeRound')
  }

  if (!reason.trim()) problems.push('A penalty needs a reason')

  return problems
}
