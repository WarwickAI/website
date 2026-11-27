import { describe, expect, it } from 'vitest'
import {
  matchResults,
  parseResults,
  type MatchCandidate,
  type RoundResultsFile,
  pickBots,
  type PickMode,
  leftOutBots,
  leftOutReason,
} from './rounds'
import type { CompetitionData } from './model'
import { teamStatuses } from './team-status'
import {
  END,
  competition,
  day,
  penalty,
  submission,
  team,
  user,
} from './test-fixtures'

const file = (players: RoundResultsFile['players']): RoundResultsFile => ({
  playedAt: '2026-11-30T18:00:00Z',
  complete: true,
  seed: 1,
  hands: 100,
  players,
})

const player = (
  repo: string | null,
  commit: string | null,
  place: number,
  score: number,
  extra = {},
) => ({
  name: repo ?? 'example',
  repo,
  commit,
  place,
  score,
  ...extra,
})

const candidate = (
  submissionId: string,
  repoFullName: string,
  commitHash: string,
  teamId: string,
  projectId = 'poker',
): MatchCandidate => ({
  submissionId,
  repoFullName,
  commitHash,
  teamId,
  projectId,
})

describe('parseResults', () => {
  it('parses a valid results file', () => {
    const results = parseResults(
      file([player('a/bot', 'c1', 1, 500, { peakChips: 3000 })]),
    )
    expect(results.players[0].peakChips).toBe(3000)
  })

  it('rejects a player without a place', () => {
    expect(() =>
      parseResults({
        playedAt: '2026-11-30T18:00:00Z',
        players: [{ name: 'x', repo: 'a/b', commit: 'c', score: 1 }],
      }),
    ).toThrow()
  })

  it('rejects a file without playedAt', () => {
    expect(() => parseResults({ players: [] })).toThrow()
  })
})

describe('matchResults', () => {
  it('matches each player to its submission and keeps extra details', () => {
    const { rows, problems } = matchResults(
      file([player('a/bot', 'c1', 1, 500, { peakChips: 3000 })]),
      [candidate('s1', 'a/bot', 'c1', 'A')],
      'poker',
    )
    expect(problems).toEqual([])
    expect(rows).toEqual([
      {
        submissionId: 's1',
        teamId: 'A',
        repo: 'a/bot',
        place: 1,
        points: 500,
        details: { peakChips: 3000 },
      },
    ])
  })

  it('skips players without a repo', () => {
    const { rows, skipped } = matchResults(
      file([player(null, null, 2, 10)]),
      [],
      'poker',
    )
    expect(rows).toEqual([])
    expect(skipped).toEqual(['example'])
  })

  it('matches by commit after the repo was renamed', () => {
    const { rows, problems } = matchResults(
      file([player('sath69/PokerBot', 'c1', 3, 100)]),
      [candidate('s1', 'sathujan18/PokerBot', 'c1', 'S')],
      'poker',
    )
    expect(problems).toEqual([])
    expect(rows.map((r) => r.submissionId)).toEqual(['s1'])
  })

  it('prefers the repo with the same name when two repos share a commit', () => {
    const { rows, problems } = matchResults(
      file([player('b/fork', 'c1', 1, 100)]),
      [
        candidate('s1', 'a/bot', 'c1', 'A'),
        candidate('s2', 'B/Fork', 'c1', 'B'),
      ],
      'poker',
    )
    expect(problems).toEqual([])
    expect(rows.map((r) => r.submissionId)).toEqual(['s2'])
  })

  it('problem when two players are the same team', () => {
    const { problems } = matchResults(
      file([player('z/one', 'c1', 1, 100), player('z/two', 'c2', 2, 50)]),
      [
        candidate('s1', 'z/one', 'c1', 'Z'),
        candidate('s2', 'z/two', 'c2', 'Z'),
      ],
      'poker',
    )
    expect(problems).toHaveLength(1)
  })

  it('problem when the commit belongs to another competition', () => {
    const { problems } = matchResults(
      file([player('a/snake', 'c1', 1, 100)]),
      [candidate('s1', 'a/snake', 'c1', 'A', 'snake')],
      'poker',
    )
    expect(problems).toHaveLength(1)
  })

  it('problem when no submission has the commit', () => {
    const { problems } = matchResults(
      file([player('a/bot', 'missing', 1, 100)]),
      [candidate('s1', 'a/bot', 'c1', 'A')],
      'poker',
    )
    expect(problems).toHaveLength(1)
  })
})

const NOW = day(30)
const pick = (data: CompetitionData, mode: PickMode = 'latest') =>
  pickBots(data, teamStatuses(data, NOW), mode)

describe('pickBots', () => {
  it('only active teams play', () => {
    const data = competition()
    team(data, 'active', {
      members: [user(data, 'a')],
      repos: [{ id: 'a', collaborators: ['gh-a'] }],
    })
    team(data, 'unclaimed', {
      repos: [{ id: 'u', collaborators: ['gh-ghost'] }],
    })
    team(data, 'held', {
      members: [user(data, 'h')],
      repos: [{ id: 'h', collaborators: ['gh-h', 'gh-a'] }],
    })
    team(data, 'dsq', { members: [user(data, 'd')], repos: [{ id: 'd' }] })
    penalty(data, { kind: 'dsq', teamId: 'dsq' })
    team(data, 'hidden', { members: [user(data, 'x')], repos: [{ id: 'x' }] })
    penalty(data, { kind: 'hidden', teamId: 'hidden' })
    team(data, 'ineligible', {
      members: [user(data, 'i')],
      repos: [{ id: 'i' }],
    })
    penalty(data, { kind: 'ineligible', teamId: 'ineligible' })
    for (const repositoryId of ['a', 'u', 'h', 'd', 'x', 'i']) {
      submission(data, {
        id: `s-${repositoryId}`,
        repositoryId,
        score: 1,
        submittedAt: day(1),
      })
    }

    expect(
      pick(data)
        .map((b) => b.teamId)
        .sort(),
    ).toEqual(['active', 'ineligible'])
  })

  it("latest takes the newest submission across all of a team's repos", () => {
    const data = competition()
    team(data, 'A', {
      members: [user(data, 'a')],
      repos: [
        { id: 'old', fullName: 'a/old' },
        { id: 'new', fullName: 'a/new' },
      ],
    })
    submission(data, {
      id: 'best',
      repositoryId: 'old',
      score: 90,
      submittedAt: day(1),
    })
    submission(data, {
      id: 'newest',
      repositoryId: 'new',
      score: 10,
      submittedAt: day(2),
    })

    const [bot] = pick(data)
    expect(bot.submission.id).toBe('newest')
    expect(bot.repositoryId).toBe('new')
    expect(bot.repoFullName).toBe('a/new')
  })

  it('best takes the highest score, ties going to the newest', () => {
    const data = competition()
    team(data, 'A', { members: [user(data, 'a')], repos: [{ id: 'r' }] })
    submission(data, {
      id: 'tieOld',
      repositoryId: 'r',
      score: 90,
      submittedAt: day(1),
    })
    submission(data, {
      id: 'tieNew',
      repositoryId: 'r',
      score: 90,
      submittedAt: day(2),
    })
    submission(data, {
      id: 'newest',
      repositoryId: 'r',
      score: 10,
      submittedAt: day(3),
    })

    expect(pick(data, 'best')[0].submission.id).toBe('tieNew')
  })

  it('ignores submissions after the end', () => {
    const data = competition()
    team(data, 'A', { members: [user(data, 'a')], repos: [{ id: 'r' }] })
    submission(data, {
      id: 'onTime',
      repositoryId: 'r',
      score: 1,
      submittedAt: day(1),
    })
    submission(data, {
      id: 'late',
      repositoryId: 'r',
      score: 1,
      submittedAt: new Date(END.getTime() + 60_000),
    })

    expect(pick(data)[0].submission.id).toBe('onTime')
  })

  it('sorts by score', () => {
    const data = competition()
    for (const [id, score] of [
      ['low', 1],
      ['high', 9],
      ['mid', 5],
    ] as const) {
      team(data, id, { members: [user(data, id)], repos: [{ id }] })
      submission(data, {
        id: `s-${id}`,
        repositoryId: id,
        score,
        submittedAt: day(1),
      })
    }

    expect(pick(data).map((b) => b.teamId)).toEqual(['high', 'mid', 'low'])
  })
})

describe('leftOutBots', () => {
  it('lists teams with an on-time submission that pickBots leaves out, and why', () => {
    const data = competition()
    team(data, 'active', {
      members: [user(data, 'Alice', 'gh-a')],
      repos: [{ id: 'a', collaborators: ['gh-a'] }],
    })
    team(data, 'unclaimed', {
      repos: [{ id: 'u', collaborators: ['gh-ghost'] }],
    })
    team(data, 'held', {
      members: [user(data, 'Harry', 'gh-h')],
      repos: [{ id: 'h', collaborators: ['gh-h', 'gh-a', 'gh-stranger'] }],
    })
    team(data, 'dsq', { members: [user(data, 'Dan')], repos: [{ id: 'd' }] })
    penalty(data, { kind: 'dsq', teamId: 'dsq' })
    // Only a late submission, so it wouldn't play anyway
    team(data, 'late', { repos: [{ id: 'l', collaborators: ['gh-late'] }] })
    for (const repositoryId of ['a', 'u', 'h', 'd']) {
      submission(data, {
        id: `s-${repositoryId}`,
        repositoryId,
        score: 1,
        submittedAt: day(1),
      })
    }
    submission(data, {
      id: 's-l',
      repositoryId: 'l',
      score: 1,
      submittedAt: new Date(END.getTime() + 1),
    })

    const leftOut = leftOutBots(data, teamStatuses(data, NOW))
    expect(leftOut.map((t) => [t.repoFullName, leftOutReason(t)])).toEqual([
      ['dsq/d', 'disqualified'],
      ['held/h', 'on hold: Alice (on active/a) can push to it'],
      ['unclaimed/u', 'unclaimed: nobody on the team has signed in'],
    ])
  })

  it('says when a team is hidden, or nobody is on it any more', () => {
    const data = competition()
    team(data, 'now', {
      members: [user(data, 'Alice', 'gh-a')],
      repos: [{ id: 'n', collaborators: ['gh-a'] }],
    })
    // Alice's first repo, from before she joined her current team
    team(data, 'old', { repos: [{ id: 'o', collaborators: ['gh-a'] }] })
    team(data, 'hidden', { members: [user(data, 'Hal')], repos: [{ id: 'x' }] })
    penalty(data, { kind: 'hidden', teamId: 'hidden' })
    for (const repositoryId of ['n', 'o', 'x']) {
      submission(data, {
        id: `s-${repositoryId}`,
        repositoryId,
        score: 1,
        submittedAt: day(1),
      })
    }

    expect(
      leftOutBots(data, teamStatuses(data, NOW)).map((t) => [
        t.repoFullName,
        leftOutReason(t),
      ]),
    ).toEqual([
      ['hidden/x', 'hidden'],
      ['old/o', 'nobody is on it: its people are on other teams'],
    ])
  })

  it('says who on which other team can push to a held team', () => {
    const data = competition()
    team(data, 'other', {
      members: [user(data, 'Olly', 'gh-o')],
      repos: [{ id: 'o', collaborators: ['gh-o'] }],
    })
    team(data, 'held', {
      members: [user(data, 'Harry', 'gh-h')],
      repos: [{ id: 'h', collaborators: ['gh-h', 'gh-o'] }],
    })
    submission(data, {
      id: 's-h',
      repositoryId: 'h',
      score: 1,
      submittedAt: day(1),
    })
    const [held] = leftOutBots(data, teamStatuses(data, NOW))
    expect(held.holdBy).toEqual([{ who: 'Olly', otherRepoFullName: 'other/o' }])
  })
})
