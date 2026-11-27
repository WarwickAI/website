// Login records are kept until 3 months after the last competition running
// when they were made ends, or 3 months after the login if none was running

const RETENTION_MONTHS = 3

function monthsAfter(date: Date, months: number): Date {
  const later = new Date(date)
  later.setUTCMonth(later.getUTCMonth() + months)
  return later
}

export function loginRecordsToDelete(
  records: { id: string; loggedInAt: Date }[],
  projects: { startDate: Date; endDate: Date | null }[],
  now: Date,
): string[] {
  return records
    .filter(({ loggedInAt }) => {
      const running = projects.filter(
        (p) =>
          p.startDate <= loggedInAt && (!p.endDate || loggedInAt <= p.endDate),
      )
      // A competition with no end date keeps them until it has one
      if (running.some((p) => !p.endDate)) return false
      const ends = running.map((p) => p.endDate!.getTime())
      const from = ends.length ? new Date(Math.max(...ends)) : loggedInAt
      return now > monthsAfter(from, RETENTION_MONTHS)
    })
    .map((r) => r.id)
}
