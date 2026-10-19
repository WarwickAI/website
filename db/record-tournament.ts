import { db, eq, and, inArray, Project, Submission, Tournament, TournamentResult } from 'astro:db'
import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { matchResults, parseResults } from '../src/lib/tournaments'

// Records a round of a project's live tournaments, so the leaderboard adds each
// team's points to their total. Run from the website root:
//
//   PROJECT_ID=poker ROUND=1 RESULTS=round-1.json DRY_RUN=1 \
//     npx astro db execute db/record-tournament.ts --remote
//
// RESULTS is the file from poker's `poker run --snapshots ... --results`.
// Each team is matched to its submission by the commit which played, so the
// snapshots must come from db/download-snapshots.ts.
//
// - DRY_RUN=1 only prints what would be recorded
// - Recording a round again replaces it, e.g. to fix a mistake
// - FORCE=1 records a tournament which was stopped before it finished
//
// This only reads the results file, and never runs anyone's code.

export default async function recordTournament() {
  // astro db execute only loads its own ASTRO_* variables
  if (existsSync('.env')) process.loadEnvFile('.env')

  const { PROJECT_ID, ROUND, RESULTS, DRY_RUN, FORCE } = process.env
  const round = Number(ROUND)
  if (!Number.isInteger(round) || round < 1) {
    throw new Error('Set ROUND to the number of this tournament, starting from 1')
  }
  if (!RESULTS || !existsSync(RESULTS)) {
    throw new Error('Set RESULTS to the results file from `poker run --results`')
  }

  const projects = await db.select().from(Project)
  const project = projects.find((p) => p.id === PROJECT_ID)
  if (!project) {
    throw new Error(
      `Set PROJECT_ID to one of: ${projects.map((p) => p.id).join(', ')}`,
    )
  }

  const results = parseResults(JSON.parse(readFileSync(RESULTS, 'utf-8')))
  if (!results.complete && FORCE !== '1') {
    throw new Error(
      'This tournament was stopped before it finished. Set FORCE=1 to record it anyway',
    )
  }

  const commits = results.players
    .map((p) => p.commit)
    .filter((c): c is string => c !== null)
  const submissions = commits.length
    ? await db
        .select()
        .from(Submission)
        .where(inArray(Submission.commitHash, commits))
    : []

  const { rows, skipped, problems } = matchResults(results, submissions, project.id)
  if (problems.length) {
    throw new Error(
      `Nothing was recorded, as some results don't match a submission:\n  ${problems.join('\n  ')}`,
    )
  }
  if (!rows.length) {
    throw new Error('Nothing was recorded, as none of the players is a team')
  }

  const existing = await db
    .select()
    .from(Tournament)
    .where(and(eq(Tournament.projectId, project.id), eq(Tournament.round, round)))
    .get()

  console.log(`${project.id} round ${round}, played ${results.playedAt}:`)
  for (const row of [...rows].sort((a, b) => a.place - b.place)) {
    console.log(`  ${String(row.place).padStart(3)}. ${row.repo.padEnd(40)} ${row.points}`)
  }
  if (skipped.length) {
    console.log(`Not recorded, as they aren't teams: ${skipped.join(', ')}`)
  }
  if (existing) {
    console.log(`This replaces round ${round} as it was recorded on ${existing.recordedAt.toISOString()}`)
  }

  if (DRY_RUN === '1') {
    console.log('\nDry run, so nothing was recorded')
    return
  }

  const tournamentId = existing?.id ?? randomUUID()
  const playedAt = new Date(results.playedAt)
  const details = { seed: results.seed ?? null, hands: results.hands ?? null, complete: results.complete }
  const resultRows = rows.map((row) => ({
    id: randomUUID(),
    tournamentId,
    submissionId: row.submissionId,
    place: row.place,
    points: row.points,
    details: row.details,
  }))

  // In one batch, so a round is never left half recorded
  if (existing) {
    await db.batch([
      db
        .update(Tournament)
        .set({ playedAt, details, recordedAt: new Date() })
        .where(eq(Tournament.id, tournamentId)),
      db.delete(TournamentResult).where(eq(TournamentResult.tournamentId, tournamentId)),
      db.insert(TournamentResult).values(resultRows),
    ])
  } else {
    await db.batch([
      db.insert(Tournament).values({ id: tournamentId, projectId: project.id, round, playedAt, details }),
      db.insert(TournamentResult).values(resultRows),
    ])
  }

  console.log(`\nRecorded ${rows.length} results for round ${round}`)
}
