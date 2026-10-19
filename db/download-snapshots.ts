import { db, eq, Project, Submission } from 'astro:db'
import { get } from '@vercel/blob'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

// Downloads one submission per repo from before the project's deadline, for
// final testing or a tournament round. Run from the website root:
//
//   PROJECT_ID=snake PICK=best npx astro db execute db/download-snapshots.ts --remote
//
// - PICK=best takes each repo's highest score, e.g. for final testing
// - PICK=latest takes each repo's most recent, e.g. for a tournament round
//
// Reads BLOB_READ_WRITE_TOKEN from .env (or the shell, which wins). Each repo
// is unpacked into snapshots/<project>/<owner>__<repo>/, with a manifest.csv
// of what was picked alongside.
//
// This is students' code - only run it with the competitions repo's
// results/run.sh, which keeps it away from this folder's .env.

const PICK_MODES = ['best', 'latest'] as const
type PickMode = (typeof PICK_MODES)[number]

export default async function downloadSnapshots() {
  // astro db execute only loads its own ASTRO_* variables
  if (existsSync('.env')) process.loadEnvFile('.env')

  const mode = process.env.PICK as PickMode
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

  const submissions = await db
    .select()
    .from(Submission)
    .where(eq(Submission.projectId, project.id))
  const picked = pickSubmissions(submissions, project.endDate ?? null, mode)

  const manifest = ['repo,commit,score,submittedAt,folder']
  const missing: string[] = []

  for (const submission of picked) {
    const { submissionRepo: repo, commitHash: sha } = submission
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
    `Downloaded ${picked.length - missing.length} of ${picked.length} repos (${mode} submission of each) to ${outDir}`,
  )
  if (missing.length) {
    console.log(
      `\nCouldn't get a snapshot for these, fetch them from GitHub instead:`,
    )
    for (const line of missing) console.log(`  ${line}`)
  }
}

// Each repo's highest score (the later one on a tie) or most recent submission
// from before the deadline, sorted best score first
export function pickSubmissions<
  T extends { submissionRepo: string; score: number; submittedAt: Date },
>(submissions: T[], endDate: Date | null, mode: PickMode): T[] {
  const picked = new Map<string, T>()
  for (const submission of submissions) {
    if (endDate && submission.submittedAt > endDate) continue

    const current = picked.get(submission.submissionRepo)
    if (!current || isPreferred(submission, current, mode)) {
      picked.set(submission.submissionRepo, submission)
    }
  }
  return [...picked.values()].sort((a, b) => b.score - a.score)
}

function isPreferred(
  a: { score: number; submittedAt: Date },
  b: { score: number; submittedAt: Date },
  mode: PickMode,
): boolean {
  if (mode === 'best' && a.score !== b.score) return a.score > b.score
  return a.submittedAt > b.submittedAt
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
