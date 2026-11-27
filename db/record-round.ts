import {
  db,
  eq,
  and,
  inArray,
  Project,
  Repository,
  Round,
  RoundResult,
  Submission,
  Team,
} from 'astro:db'
import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { matchResults, parseResults } from '../src/lib/competition/rounds'

// Records a round of a project's live tournaments, so the leaderboard adds each
// team's points to their total. Run from the website root:
//
//   PROJECT_ID=poker ROUND=8 RESULTS=round-8.json DRY_RUN=1 \
//     npx astro db execute db/record-round.ts --remote
//
// RESULTS is the file from poker's `poker run --snapshots ... --results`.
// Each team is matched to its submission by the commit which played, so the
// snapshots must come from db/download-snapshots.ts. A team can only play once
// per round.
//
// - DRY_RUN=1 only prints what would be recorded
// - Recording a round again replaces it, e.g. to fix a mistake
// - FORCE=1 records a round which was stopped before it finished
//
// This only reads the results file, and never runs anyone's code.

export default async function recordRound() {
  // astro db execute only loads its own ASTRO_* variables
  if (existsSync('.env')) process.loadEnvFile('.env')

  const { PROJECT_ID, ROUND, RESULTS, DRY_RUN, FORCE } = process.env
  const number = Number(ROUND)
  if (!Number.isInteger(number) || number < 1) {
    throw new Error('Set ROUND to the number of this round, starting from 1')
  }
  if (!RESULTS || !existsSync(RESULTS)) {
    throw new Error(
      'Set RESULTS to the results file from `poker run --results`',
    )
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
      'This round was stopped before it finished. Set FORCE=1 to record it anyway',
    )
  }

  // In any competition, so one from another competition is caught
  const commits = results.players
    .map((p) => p.commit)
    .filter((c): c is string => c !== null)
  const candidates = commits.length
    ? await db
        .select({
          submissionId: Submission.id,
          commitHash: Submission.commitHash,
          repoFullName: Repository.fullName,
          teamId: Team.id,
          projectId: Team.projectId,
        })
        .from(Submission)
        .innerJoin(Repository, eq(Submission.repositoryId, Repository.id))
        .innerJoin(Team, eq(Repository.teamId, Team.id))
        .where(inArray(Submission.commitHash, commits))
    : []

  const { rows, skipped, problems } = matchResults(
    results,
    candidates,
    project.id,
  )
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
    .from(Round)
    .where(and(eq(Round.projectId, project.id), eq(Round.number, number)))
    .get()

  console.log(`${project.id} round ${number}, played ${results.playedAt}:`)
  for (const row of [...rows].sort((a, b) => a.place - b.place)) {
    console.log(
      `  ${String(row.place).padStart(3)}. ${row.repo.padEnd(40)} ${row.points}`,
    )
  }
  if (skipped.length) {
    console.log(`Not recorded, as they aren't teams: ${skipped.join(', ')}`)
  }
  if (existing) {
    console.log(
      `This replaces round ${number} as it was recorded on ${existing.recordedAt.toISOString()}`,
    )
  }

  if (DRY_RUN === '1') {
    console.log('\nDry run, so nothing was recorded')
    return
  }

  const roundId = existing?.id ?? randomUUID()
  const playedAt = new Date(results.playedAt)
  const details = {
    seed: results.seed ?? null,
    hands: results.hands ?? null,
    complete: results.complete,
  }
  const resultRows = rows.map((row) => ({
    id: randomUUID(),
    roundId,
    submissionId: row.submissionId,
    place: row.place,
    points: row.points,
    details: row.details,
  }))

  // In one batch, so a round is never left half recorded
  if (existing) {
    await db.batch([
      db
        .update(Round)
        .set({ playedAt, details, recordedAt: new Date() })
        .where(eq(Round.id, roundId)),
      db.delete(RoundResult).where(eq(RoundResult.roundId, roundId)),
      db.insert(RoundResult).values(resultRows),
    ])
  } else {
    await db.batch([
      db
        .insert(Round)
        .values({
          id: roundId,
          projectId: project.id,
          number,
          playedAt,
          details,
        }),
      db.insert(RoundResult).values(resultRows),
    ])
  }

  console.log(`\nRecorded ${rows.length} results for round ${number}`)
}
