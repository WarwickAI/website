import { describe, expect, it } from 'vitest'
import type { PenaltyRow } from './model'
import { checkIntegrity, type DatabaseRows } from './integrity'

const NOW = new Date('2026-11-20T12:00:00Z')
const EARLY = new Date('2026-10-20T12:00:00Z')

// Poker (running) and snake (ended): alice is on poker team A with repo a,
// bob on poker team B with repo b, and each team's results are in round 8
function rows(): DatabaseRows {
  return {
    projects: [
      {
        id: 'poker',
        endDate: new Date('2026-12-08T17:00:00Z'),
        teamsLockAt: null,
      },
      {
        id: 'snake',
        endDate: new Date('2025-12-05T17:00:00Z'),
        teamsLockAt: null,
      },
    ],
    teams: [
      { id: 'A', projectId: 'poker' },
      { id: 'B', projectId: 'poker' },
      { id: 'S', projectId: 'snake' },
    ],
    participants: [
      { id: 'p-alice', projectId: 'poker', userId: 'u-alice' },
      { id: 'p-bob', projectId: 'poker', userId: 'u-bob' },
    ],
    teamMembers: [
      { participantId: 'p-alice', teamId: 'A' },
      { participantId: 'p-bob', teamId: 'B' },
    ],
    repositories: [
      { id: 'a', teamId: 'A', fullName: 'alice/bot' },
      { id: 'b', teamId: 'B', fullName: 'bob/bot' },
      { id: 's', teamId: 'S', fullName: 'sam/snake' },
    ],
    collaborators: [
      {
        repositoryId: 'a',
        githubUserId: 'gh-alice',
        addedAt: EARLY,
        removedAt: null,
      },
      {
        repositoryId: 'b',
        githubUserId: 'gh-bob',
        addedAt: EARLY,
        removedAt: null,
      },
    ],
    submissions: [
      { id: 'sa', repositoryId: 'a' },
      { id: 'sb', repositoryId: 'b' },
      { id: 'ss', repositoryId: 's' },
    ],
    rounds: [
      { id: 'r7', projectId: 'poker', number: 7 },
      { id: 'r8', projectId: 'poker', number: 8 },
    ],
    roundResults: [
      { roundId: 'r8', submissionId: 'sa' },
      { roundId: 'r8', submissionId: 'sb' },
    ],
    penalties: [],
    userIdOfGithub: new Map([
      ['gh-alice', 'u-alice'],
      ['gh-bob', 'u-bob'],
    ]),
  }
}

function penalty(
  p: Partial<PenaltyRow> & Pick<PenaltyRow, 'kind'>,
): PenaltyRow {
  return {
    id: 'pen',
    teamId: null,
    participantId: null,
    points: null,
    beforeRound: null,
    reason: 'test',
    publicNote: null,
    createdAt: EARLY,
    liftedAt: null,
    ...p,
  }
}

describe('checkIntegrity', () => {
  it('clean data has no problems or flags', () => {
    expect(checkIntegrity(rows(), NOW)).toEqual({ problems: [], flags: [] })
  })

  it("problem when a team member's team is in another competition", () => {
    const data = rows()
    data.teams.push({ id: 'X', projectId: 'snake' })
    data.teamMembers[0].teamId = 'X'
    expect(checkIntegrity(data, NOW).problems).toHaveLength(1)
  })

  it("problem when a round result's team is in another competition", () => {
    const data = rows()
    data.roundResults.push({ roundId: 'r7', submissionId: 'ss' })
    expect(checkIntegrity(data, NOW).problems).toHaveLength(1)
  })

  it('poker round 7 duplicates are allowed, round 8 duplicates are a problem', () => {
    const data = rows()
    data.repositories.push({ id: 'a2', teamId: 'A', fullName: 'alice/bot2' })
    data.submissions.push({ id: 'sa2', repositoryId: 'a2' })
    data.roundResults.push(
      { roundId: 'r7', submissionId: 'sa' },
      { roundId: 'r7', submissionId: 'sa2' },
    )
    expect(checkIntegrity(data, NOW).problems).toEqual([])

    data.roundResults.push({ roundId: 'r8', submissionId: 'sa2' })
    expect(checkIntegrity(data, NOW).problems).toHaveLength(1)
  })

  it('problem for a penalty that breaks the rules', () => {
    const data = rows()
    data.penalties.push(
      penalty({ kind: 'points', participantId: 'p-alice', points: 100 }),
    )
    expect(checkIntegrity(data, NOW).problems).toHaveLength(1)
  })

  it('flags a left team in a running competition', () => {
    const data = rows()
    data.teams.push({ id: 'old', projectId: 'poker' })
    data.repositories.push({ id: 'o', teamId: 'old', fullName: 'alice/old' })
    data.collaborators.push({
      repositoryId: 'o',
      githubUserId: 'gh-alice',
      addedAt: EARLY,
      removedAt: null,
    })
    expect(checkIntegrity(data, NOW).flags).toHaveLength(1)
  })

  it('flags a member of one team who can push to a disqualified team', () => {
    const data = rows()
    data.collaborators.push({
      repositoryId: 'b',
      githubUserId: 'gh-alice',
      addedAt: EARLY,
      removedAt: null,
    })
    data.penalties.push(penalty({ kind: 'dsq', teamId: 'B' }))
    const { flags } = checkIntegrity(data, NOW)
    expect(flags).toHaveLength(1)
    expect(flags[0]).toContain('bob/bot')
  })
})
