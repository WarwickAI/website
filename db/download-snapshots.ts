import { db, Project } from 'astro:db'
import { get } from '@vercel/blob'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { loadCompetition } from '../src/lib/competition/data'
import {
  leftOutBots,
  leftOutReason,
  PICK_MODES,
  pickBots,
  type PickMode,
} from '../src/lib/competition/rounds'
import { teamStatuses } from '../src/lib/competition/team-status'

// Downloads one submission per team from before the project's deadline, for
// final testing or a tournament round. Run from the website root:
//
//   PROJECT_ID=snake npx astro db execute db/download-snapshots.ts --remote
//
// - PICK=latest (the default) takes each team's most recent, from any of its
//   repos, e.g. for a tournament round
// - PICK=best takes each team's highest score, e.g. for final testing
//
// Only teams which can play are picked. At the end it lists the rest and why,
// so ones on hold or unclaimed can be chased before the round.
//
// Reads BLOB_READ_WRITE_TOKEN from .env (or the shell, which wins). Each bot
// is unpacked into snapshots/<project>/<owner>__<repo>/, with a manifest.csv
// of what was picked alongside.
//
// This is students' code - only run it with the competitions repo's
// results/run.sh, which keeps it away from this folder's .env.

export default async function downloadSnapshots() {
  // astro db execute only loads its own ASTRO_* variables
  if (existsSync('.env')) process.loadEnvFile('.env')

  const mode = (process.env.PICK ?? 'latest') as PickMode
  if (!PICK_MODES.includes(mode)) {
    throw new Error(`Set PICK to one of: ${PICK_MODES.join(', ')}`)
  }

  const projects = await db.select().from(Project)
  const project = projects.find((p) => p.id === process.env.PROJECT_ID)
  if (!project) {
    throw new Error(
      `Set PROJECT_ID to one of: ${projects.map((p) => p.id).join(', ')}`,
    )
  }

  const outDir = path.join('snapshots', project.id)
  if (existsSync(outDir)) {
    throw new Error(`${outDir} already exists, move or delete it first`)
  }
  mkdirSync(outDir, { recursive: true })

  const data = await loadCompetition(project.id)
  const statuses = teamStatuses(data, new Date())
  const picked = pickBots(data, statuses, mode)

  const manifest = ['repo,commit,score,submittedAt,folder']
  const missing: string[] = []

  for (const { repoFullName: repo, submission } of picked) {
    const { commitHash: sha } = submission
    const folder = repo.replace('/', '__')

    const tarball = submission.snapshotUrl
      ? await download(submission.snapshotUrl)
      : null
    if (tarball) {
      const dest = path.join(outDir, folder)
      mkdirSync(dest)
      // GitHub wraps the repo in an <owner>-<repo>-<sha> folder, which this drops
      execFileSync('tar', ['-xzf', '-', '-C', dest, '--strip-components=1'], {
        input: tarball,
      })
    } else {
      missing.push(
        `${repo} (score ${submission.score}): https://github.com/${repo}/tree/${sha}`,
      )
    }

    manifest.push(
      [
        repo,
        sha,
        submission.score,
        submission.submittedAt.toISOString(),
        tarball ? folder : '',
      ].join(','),
    )
  }

  writeFileSync(path.join(outDir, 'manifest.csv'), manifest.join('\n') + '\n')

  console.log(
    `Downloaded ${picked.length - missing.length} of ${picked.length} teams (${mode} submission of each) to ${outDir}`,
  )
  if (missing.length) {
    console.log(
      `\nCouldn't get a snapshot for these, fetch them from GitHub instead:`,
    )
    for (const line of missing) console.log(`  ${line}`)
  }

  const leftOut = leftOutBots(data, statuses)
  // After the end, nothing left out can change
  const ended = !!project.endDate && new Date() > project.endDate
  const fixable = ended
    ? []
    : leftOut.filter((t) => t.state === 'onHold' || t.state === 'unclaimed')
  if (fixable.length) {
    console.log(
      `\nLeft out ${fixable.length} team${fixable.length === 1 ? '' : 's'} that could play if sorted out before the round ` +
        `(then delete ${outDir} and run this again):`,
    )
    for (const t of fixable)
      console.log(`  ${t.repoFullName}: ${leftOutReason(t)}`)
  }
  const expected = leftOut.filter((t) => !fixable.includes(t))
  if (expected.length) {
    console.log(
      ended
        ? `\nLeft out (the competition has ended, so this can't change now):`
        : `\nAlso left out, as expected:`,
    )
    for (const t of expected)
      console.log(`  ${t.repoFullName}: ${leftOutReason(t)}`)
  }
}

async function download(url: string): Promise<Buffer | null> {
  try {
    const result = await get(url, { access: 'private' })
    if (result?.statusCode !== 200) return null
    return Buffer.from(await new Response(result.stream).arrayBuffer())
  } catch (error) {
    console.error(`Failed to download ${url}:`, error)
    return null
  }
}
