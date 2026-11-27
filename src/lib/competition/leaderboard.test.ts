import { describe, expect, it } from 'vitest'
import type { CompetitionData } from './model'
import { buildLeaderboard } from './leaderboard'
import { teamStatuses } from './team-status'
import {
  END,
  START,
  competition,
  day,
  penalty,
  result,
  round,
  submission,
  team,
  user,
} from './test-fixtures'

const NOW = day(30)
const board = (data: CompetitionData) =>
  buildLeaderboard(data, teamStatuses(data, NOW))

// A team with one member and one repo, `<id>-repo`, which pushed `score` on `when`
function entry(
  data: CompetitionData,
  id: string,
  score: number,
  when = day(1),
) {
  team(data, id, {
    members: [user(data, id)],
    repos: [{ id: `${id}-repo`, fullName: `${id}/bot` }],
  })
  submission(data, {
    id: `${id}-s`,
    repositoryId: `${id}-repo`,
    score,
    submittedAt: when,
  })
}

describe('buildLeaderboard', () => {
  it('scores best on-time CI plus round points minus points penalties', () => {
    const data = competition()
    entry(data, 'A', 100)
    round(data, { id: 'r1', number: 1, playedAt: day(7) })
    round(data, { id: 'r2', number: 2, playedAt: day(14) })
    result(data, { roundId: 'r1', submissionId: 'A-s', place: 1, points: 300 })
    result(data, { roundId: 'r2', submissionId: 'A-s', place: 1, points: 500 })
    penalty(data, { kind: 'points', teamId: 'A', points: 200 })

    const [row] = board(data).ranked
    expect(row.score).toBe(700)
    expect(row.pointsPenalty).toBe(200)
  })

  it('void drops rounds before beforeRound', () => {
    const data = competition()
    entry(data, 'A', 0)
    for (const n of [1, 2, 3]) {
      round(data, { id: `r${n}`, number: n, playedAt: day(7 * n) })
      result(data, {
        roundId: `r${n}`,
        submissionId: 'A-s',
        place: 1,
        points: 100 * n,
      })
    }
    penalty(data, { kind: 'void', teamId: 'A', beforeRound: 3 })

    expect(board(data).ranked[0].score).toBe(300)
  })

  it('with two seats in a round, the most recently pushed one counts', () => {
    const data = competition()
    team(data, 'Z', {
      members: [user(data, 'zinex')],
      repos: [{ id: 'zinex' }, { id: 'zinexx' }],
    })
    submission(data, {
      id: 'older',
      repositoryId: 'zinexx',
      score: 0,
      submittedAt: day(1),
    })
    submission(data, {
      id: 'newer',
      repositoryId: 'zinex',
      score: 0,
      submittedAt: day(2),
    })
    round(data, { id: 'r6', number: 6, playedAt: day(10) })
    result(data, {
      roundId: 'r6',
      submissionId: 'older',
      place: 5,
      points: 6600,
    })
    result(data, {
      roundId: 'r6',
      submissionId: 'newer',
      place: 16,
      points: 1010,
    })

    expect(board(data).ranked[0].score).toBe(1010)
  })

  it('ranks by score, ties going to the most recent submission', () => {
    const data = competition()
    entry(data, 'low', 10, day(1))
    entry(data, 'tieOld', 50, day(1))
    entry(data, 'tieNew', 50, day(2))

    const { ranked } = board(data)
    expect(ranked.map((r) => r.teamId)).toEqual(['tieNew', 'tieOld', 'low'])
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3])
  })

  it('late-only teams go in late and a better late score is lateBest', () => {
    const data = competition()
    const afterEnd = new Date(END.getTime() + 60_000)
    entry(data, 'onTime', 40)
    submission(data, {
      id: 'onTime-late',
      repositoryId: 'onTime-repo',
      score: 90,
      submittedAt: afterEnd,
    })
    entry(data, 'lateOnly', 70, afterEnd)

    const { ranked, late } = board(data)
    expect(ranked.map((r) => r.teamId)).toEqual(['onTime'])
    expect(ranked[0].score).toBe(40)
    expect(ranked[0].lateBest).toEqual({ score: 90, submittedAt: afterEnd })
    expect(late.map((r) => [r.teamId, r.score, r.rank])).toEqual([
      ['lateOnly', 70, null],
    ])
  })

  it('unclaimed and on-hold teams are in cantRank with a reason, dsq in disqualified, left and hidden nowhere', () => {
    const data = competition()
    entry(data, 'active', 10)
    // Unclaimed: nobody has signed in
    team(data, 'unclaimed', {
      repos: [
        { id: 'u-repo', fullName: 'ghost/bot', collaborators: ['gh-ghost'] },
      ],
    })
    submission(data, {
      id: 'u-s',
      repositoryId: 'u-repo',
      score: 30,
      submittedAt: day(1),
    })
    // On hold: active's member can push to its repo
    team(data, 'held', {
      members: [user(data, 'held')],
      repos: [{ id: 'h-repo', collaborators: ['gh-held', 'gh-active'] }],
    })
    submission(data, {
      id: 'h-s',
      repositoryId: 'h-repo',
      score: 20,
      submittedAt: day(1),
    })
    // Left: its only collaborator is on the active team
    team(data, 'left', {
      repos: [{ id: 'l-repo', collaborators: ['gh-active'] }],
    })
    submission(data, {
      id: 'l-s',
      repositoryId: 'l-repo',
      score: 99,
      submittedAt: day(1),
    })
    entry(data, 'dsq', 50)
    penalty(data, { kind: 'dsq', teamId: 'dsq' })
    entry(data, 'hidden', 60)
    penalty(data, { kind: 'hidden', teamId: 'hidden' })

    const { ranked, late, cantRank, disqualified } = board(data)
    expect(ranked.map((r) => r.teamId)).toEqual(['active'])
    expect(late).toEqual([])
    expect(cantRank.map((r) => [r.teamId, r.reason])).toEqual([
      ['unclaimed', 'unclaimed'],
      ['held', 'onHold'],
    ])
    expect(cantRank[0].repoFullName).toBe('ghost/bot')
    expect(disqualified.map((r) => r.teamId)).toEqual(['dsq'])
  })

  it('a disqualified team nobody has claimed is not shown', () => {
    const data = competition()
    team(data, 'ghost', {
      repos: [
        {
          id: 'g-repo',
          fullName: 'mikedupd/poke-da-poke',
          collaborators: ['gh-mikedupd'],
        },
      ],
    })
    submission(data, {
      id: 'g-s',
      repositoryId: 'g-repo',
      score: 100,
      submittedAt: day(1),
    })
    penalty(data, { kind: 'dsq', teamId: 'ghost' })
    entry(data, 'claimed', 50)
    penalty(data, { kind: 'dsq', teamId: 'claimed' })

    const { disqualified, cantRank } = board(data)
    expect(disqualified.map((r) => r.teamId)).toEqual(['claimed'])
    expect(cantRank).toEqual([])
  })

  it('ineligible teams rank normally and are marked', () => {
    const data = competition()
    entry(data, 'first', 100)
    entry(data, 'second', 50)
    penalty(data, { kind: 'ineligible', teamId: 'first' })

    const { ranked } = board(data)
    expect(ranked.map((r) => [r.teamId, r.rank, r.ineligible])).toEqual([
      ['first', 1, true],
      ['second', 2, false],
    ])
  })

  it('works without rounds and leaves out teams with only pre-start submissions', () => {
    const data = competition({ id: 'snake', name: 'Snake' })
    entry(data, 'A', 105.079)
    entry(data, 'early', 500, new Date(START.getTime() - 60_000))

    const { ranked, late, cantRank } = board(data)
    expect(ranked.map((r) => [r.teamId, r.score])).toEqual([['A', 105.079]])
    expect(late).toEqual([])
    expect(cantRank).toEqual([])
  })

  it('shows members with their names and the newest repo', () => {
    const data = competition()
    entry(data, 'A', 1)
    const [row] = board(data).ranked
    expect(row.members).toEqual([{ userId: 'user-A', name: 'A', image: null }])
    expect(row.repoFullName).toBe('A/bot')
  })
})
