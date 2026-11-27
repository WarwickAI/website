import type { CompetitionData } from './model'
import type { TeamStatus } from './team-status'

export interface LeaderboardRow {
  teamId: string
  members: { userId: string; name: string; image: string | null }[]
  unclaimedCount: number
  repoFullName: string
  // Best CI score, plus round points, minus points penalties
  score: number
  // Breaks ties
  submittedAt: Date
  // A better score from after the deadline
  lateBest: { score: number; submittedAt: Date } | null
  rank: number | null
  ineligible: boolean
  pointsPenalty: number
  publicNotes: string[]
}

export interface Leaderboard {
  ranked: LeaderboardRow[]
  late: LeaderboardRow[]
  cantRank: (LeaderboardRow & { reason: 'unclaimed' | 'onHold' })[]
  disqualified: LeaderboardRow[]
}

type Submission = CompetitionData['submissions'][number]

// One row per team with a submission. Left and hidden teams aren't shown
export function buildLeaderboard(
  data: CompetitionData,
  statuses: Map<string, TeamStatus>,
): Leaderboard {
  const { startDate, endDate } = data.project
  const teamOfRepo = new Map(data.repositories.map((r) => [r.id, r.teamId]))
  const repoName = new Map(data.repositories.map((r) => [r.id, r.fullName]))
  const users = new Map(data.users.map((u) => [u.id, u]))
  const submissionById = new Map(data.submissions.map((s) => [s.id, s]))
  const roundNumber = new Map(data.rounds.map((r) => [r.id, r.number]))

  const submissionsOf = new Map<string, Submission[]>()
  for (const s of data.submissions) {
    const teamId = teamOfRepo.get(s.repositoryId)
    if (!teamId || s.submittedAt < startDate) continue
    submissionsOf.set(teamId, [...(submissionsOf.get(teamId) ?? []), s])
  }

  // Each team's result per round. Where a past round has two seats for one
  // team, the one pushed most recently counts
  const resultsOf = new Map<
    string,
    Map<number, { points: number; submittedAt: Date }>
  >()
  for (const r of data.roundResults) {
    const submission = submissionById.get(r.submissionId)
    const teamId = submission && teamOfRepo.get(submission.repositoryId)
    const number = roundNumber.get(r.roundId)
    if (!submission || !teamId || number === undefined) continue
    const rounds = resultsOf.get(teamId) ?? new Map()
    const counted = rounds.get(number)
    if (!counted || submission.submittedAt > counted.submittedAt) {
      rounds.set(number, {
        points: r.points,
        submittedAt: submission.submittedAt,
      })
    }
    resultsOf.set(teamId, rounds)
  }

  const board: Leaderboard = {
    ranked: [],
    late: [],
    cantRank: [],
    disqualified: [],
  }
  for (const status of statuses.values()) {
    if (status.state === 'left' || status.state === 'hidden') continue
    // Nobody signed in, so it never entered
    if (status.state === 'dsq' && !status.memberUserIds.length) continue
    const submissions = submissionsOf.get(status.teamId)
    if (!submissions?.length) continue

    const isLate = (s: Submission) => !!endDate && s.submittedAt > endDate
    const onTime = best(submissions.filter((s) => !isLate(s)))
    const late = best(submissions.filter(isLate))
    const counted = (onTime ?? late)!

    let roundPoints = 0
    for (const [number, { points }] of resultsOf.get(status.teamId) ?? []) {
      if (status.voidBeforeRound === null || number >= status.voidBeforeRound)
        roundPoints += points
    }

    const row: LeaderboardRow = {
      teamId: status.teamId,
      members: status.memberUserIds
        .map((id) => users.get(id))
        .filter((u) => !!u)
        .map((u) => ({ userId: u.id, name: u.name, image: u.image })),
      unclaimedCount: status.unclaimedCount,
      repoFullName:
        repoName.get(status.newestRepositoryId ?? counted.repositoryId) ?? '',
      score: counted.score + roundPoints - status.pointsPenalty,
      submittedAt: counted.submittedAt,
      lateBest:
        onTime && late && late.score > onTime.score
          ? { score: late.score, submittedAt: late.submittedAt }
          : null,
      rank: null,
      ineligible: status.ineligible,
      pointsPenalty: status.pointsPenalty,
      publicNotes: status.publicNotes,
    }

    if (status.state === 'dsq') board.disqualified.push(row)
    else if (status.state === 'unclaimed' || status.state === 'onHold')
      board.cantRank.push({ ...row, reason: status.state })
    else if (onTime) board.ranked.push(row)
    else board.late.push(row)
  }

  board.ranked.sort(compareBestFirst)
  board.ranked.forEach((row, i) => (row.rank = i + 1))
  board.late.sort(compareBestFirst)
  board.cantRank.sort(compareBestFirst)
  board.disqualified.sort((a, b) =>
    a.repoFullName.localeCompare(b.repoFullName),
  )
  return board
}

function best(submissions: Submission[]): Submission | null {
  return submissions.reduce<Submission | null>(
    (top, s) =>
      !top ||
      s.score > top.score ||
      (s.score === top.score && s.submittedAt > top.submittedAt)
        ? s
        : top,
    null,
  )
}

// Highest score first, ties going to the most recent
function compareBestFirst(a: LeaderboardRow, b: LeaderboardRow) {
  return b.score - a.score || b.submittedAt.getTime() - a.submittedAt.getTime()
}
