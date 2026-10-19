// A results file from a project's live tournament, e.g. from poker's
// `poker run --snapshots ... --results round-1.json`
export interface TournamentResults {
  playedAt: string
  complete: boolean // false if the tournament was stopped before it finished
  seed?: number | null
  hands?: number
  players: TournamentPlayer[]
}

export interface TournamentPlayer {
  name: string
  repo: string | null // null for players who aren't a team, such as example bots added to make up the numbers
  commit: string | null
  place: number
  score: number
  [detail: string]: unknown // anything else the project records, e.g. poker's peakChips
}

export interface MatchableSubmission {
  id: string
  projectId: string
  submissionRepo: string
  commitHash: string
}

export interface ResultRow {
  submissionId: string
  repo: string
  place: number
  points: number
  details: Record<string, unknown>
}

// Checks a results file is one this script can record, and returns it typed
export function parseResults(json: unknown): TournamentResults {
  const results = json as Partial<TournamentResults> | null
  if (!results || typeof results !== 'object' || !Array.isArray(results.players)) {
    throw new Error('Expected a results file with a list of players')
  }
  if (typeof results.playedAt !== 'string' || isNaN(Date.parse(results.playedAt))) {
    throw new Error('Expected the results file to say when it was played (playedAt)')
  }
  for (const player of results.players) {
    if (
      typeof player?.name !== 'string' ||
      !Number.isInteger(player.place) ||
      typeof player.score !== 'number' ||
      (player.repo !== null && typeof player.repo !== 'string') ||
      (player.commit !== null && typeof player.commit !== 'string')
    ) {
      throw new Error(`Expected every player to have a name, repo, commit, place and score, but got ${JSON.stringify(player)}`)
    }
  }
  return results as TournamentResults
}

// Matches each team in the results to the submission which played, by its
// commit. Players without a repo are skipped. Anything which doesn't match
// cleanly is a problem, as a result recorded against the wrong team couldn't be
// noticed on the leaderboard.
export function matchResults(
  results: TournamentResults,
  submissions: MatchableSubmission[],
  projectId: string,
): { rows: ResultRow[]; skipped: string[]; problems: string[] } {
  const byCommit = new Map(submissions.map((s) => [s.commitHash, s]))
  const rows: ResultRow[] = []
  const skipped: string[] = []
  const problems: string[] = []
  const seenRepos = new Set<string>()

  for (const player of results.players) {
    if (player.repo === null || player.commit === null) {
      skipped.push(player.name)
      continue
    }

    const repo = player.repo.toLowerCase()
    if (seenRepos.has(repo)) {
      problems.push(`${player.repo} played more than once`)
      continue
    }
    seenRepos.add(repo)

    const submission = byCommit.get(player.commit)
    if (!submission) {
      problems.push(`${player.repo}: there is no submission for commit ${player.commit}`)
      continue
    }
    if (submission.projectId !== projectId) {
      problems.push(`${player.repo}: commit ${player.commit} is a submission to ${submission.projectId}, not ${projectId}`)
      continue
    }
    if (submission.submissionRepo.toLowerCase() !== repo) {
      problems.push(`${player.repo}: commit ${player.commit} was submitted by ${submission.submissionRepo}`)
      continue
    }

    const { name, repo: _repo, commit, place, score, ...details } = player
    rows.push({ submissionId: submission.id, repo: submission.submissionRepo, place, points: score, details })
  }

  return { rows, skipped, problems }
}

// Each repo's points from every round, keyed by repo in lower case
export function totalPointsByRepo(
  results: { submissionRepo: string; points: number }[],
): Map<string, number> {
  const totals = new Map<string, number>()
  for (const { submissionRepo, points } of results) {
    const repo = submissionRepo.toLowerCase()
    totals.set(repo, (totals.get(repo) ?? 0) + points)
  }
  return totals
}

// Adds each repo's tournament points to every one of its submissions. So a
// team's best submission, which is what ranks them, carries their points from
// every round, even if a different submission of theirs played each week.
export function addTournamentPoints<T extends { score: number; submissionRepo: string }>(
  submissions: T[],
  totals: Map<string, number>,
): T[] {
  return submissions.map((s) => ({
    ...s,
    score: s.score + (totals.get(s.submissionRepo.toLowerCase()) ?? 0),
  }))
}
