export interface LeaderboardSubmission {
  score: number
  submittedAt: Date
  githubUserIds: number[]
}

export interface RankedEntry<T> {
  submission: T
  // A better score one of this entry's contributors got after the deadline
  lateBest: T | null
}

// Picks what a project's leaderboard shows. Everyone appears once: ranked by
// their best on-time submission, or, if that doesn't rank them, by their best
// late one in `late` below the rankings. Submissions from before the
// competition opened don't count.
export function buildLeaderboard<T extends LeaderboardSubmission>(
  submissions: T[],
  { startDate, endDate }: { startDate: Date | null; endDate: Date | null },
): { ranked: RankedEntry<T>[]; late: T[] } {
  const sorted = submissions
    .filter((s) => !startDate || s.submittedAt >= startDate)
    .sort(compareBestFirst)
  const isLate = (s: T) => !!endDate && s.submittedAt > endDate
  const onTime = sorted.filter((s) => !isLate(s))
  const late = sorted.filter(isLate)

  const shown = new Set<number>()
  const ranked = onePerPerson(onTime, shown).map((submission) => {
    // `late` is sorted best first, so this is their best late submission
    const lateBest = late.find((l) => sharesContributor(l, submission))
    return {
      submission,
      lateBest: lateBest && lateBest.score > submission.score ? lateBest : null,
    }
  })

  // Carries on from the rankings, so this only adds people who aren't ranked
  const lateOnly = onePerPerson(late, shown)

  return { ranked, late: lateOnly }
}

// Highest score first, ties going to the most recent
function compareBestFirst(a: LeaderboardSubmission, b: LeaderboardSubmission) {
  return b.score - a.score || b.submittedAt.getTime() - a.submittedAt.getTime()
}

function sharesContributor(a: LeaderboardSubmission, b: LeaderboardSubmission) {
  return a.githubUserIds.some((id) => b.githubUserIds.includes(id))
}

// Keeps each submission whose contributors aren't already in `shown`, so
// everyone appears once, with their best submission that doesn't repeat
// someone shown higher up. Expects `submissions` sorted best first
function onePerPerson<T extends LeaderboardSubmission>(
  submissions: T[],
  shown: Set<number>,
): T[] {
  return submissions.filter((s) => {
    if (s.githubUserIds.some((id) => shown.has(id))) return false
    s.githubUserIds.forEach((id) => shown.add(id))
    return true
  })
}
