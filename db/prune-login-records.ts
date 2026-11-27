import { db, inArray, LoginRecord, Project } from 'astro:db'
import { loginRecordsToDelete } from '../src/lib/competition/login-retention'

// Deletes login records past their retention. Run it monthly from the website
// root, with DRY_RUN=1 first:
//
//   DRY_RUN=1 npx astro db execute db/prune-login-records.ts --remote

export default async function pruneLoginRecords() {
  const [records, projects] = await Promise.all([
    db
      .select({ id: LoginRecord.id, loggedInAt: LoginRecord.loggedInAt })
      .from(LoginRecord),
    db
      .select({ startDate: Project.startDate, endDate: Project.endDate })
      .from(Project),
  ])
  const ids = loginRecordsToDelete(
    records,
    projects.map((p) => ({ ...p, endDate: p.endDate ?? null })),
    new Date(),
  )

  console.log(
    `${ids.length} of ${records.length} login records are past their retention`,
  )
  if (process.env.DRY_RUN === '1') {
    console.log('Dry run, so nothing was deleted')
    return
  }
  for (let i = 0; i < ids.length; i += 100) {
    await db
      .delete(LoginRecord)
      .where(inArray(LoginRecord.id, ids.slice(i, i + 100)))
  }
  console.log(`Deleted ${ids.length}`)
}
