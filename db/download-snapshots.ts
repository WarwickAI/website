import { db, eq, Project, Submission } from 'astro:db'
import { get } from '@vercel/blob'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

// Downloads each repo's best submission from before the project's deadline,
// for final testing. Run from the website root:
//
//   PROJECT_ID=snake BLOB_READ_WRITE_TOKEN=... \
//     npx astro db execute db/download-snapshots.ts --remote
//
// Each repo is unpacked into snapshots/<project>/<owner>__<repo>/, with a
// manifest.csv of what was picked alongside.
//
// This is students' code - run it somewhere without these credentials.

export default async function downloadSnapshots() {
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
  const best = pickBestSubmissions(submissions, project.endDate ?? null)

  const manifest = ['repo,commit,score,submittedAt,folder']
  const missing: string[] = []

  for (const submission of best) {
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
    `Downloaded ${best.length - missing.length} of ${best.length} repos to ${outDir}`,
  )
  if (missing.length) {
    console.log(
      `\nCouldn't get a snapshot for these, fetch them from GitHub instead:`,
    )
    for (const line of missing) console.log(`  ${line}`)
  }
}

// Each repo's highest score from before the deadline (the later one on a tie),
// sorted best first
export function pickBestSubmissions<
  T extends { submissionRepo: string; score: number; submittedAt: Date },
>(submissions: T[], endDate: Date | null): T[] {
  const best = new Map<string, T>()
  for (const submission of submissions) {
    if (endDate && submission.submittedAt > endDate) continue

    const current = best.get(submission.submissionRepo)
    if (
      !current ||
      submission.score > current.score ||
      (submission.score === current.score &&
        submission.submittedAt > current.submittedAt)
    ) {
      best.set(submission.submissionRepo, submission)
    }
  }
  return [...best.values()].sort((a, b) => b.score - a.score)
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
