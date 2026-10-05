import { db, eq, isNull, Submission } from 'astro:db'
import { existsSync } from 'node:fs'
import { App, Octokit } from 'octokit'
import { snapshotSubmission } from '../src/lib/snapshots'

// Snapshots submissions that were recorded before the webhook started taking
// snapshots. Only touches rows still missing one, so it's safe to rerun.
// Run from the website root:
//
//   DRY_RUN=1 npx astro db execute db/backfill-snapshots.ts --remote
//
// Reads GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY from .env (or the shell,
// which wins). Without DRY_RUN it uploads, so it also needs
// BLOB_READ_WRITE_TOKEN. Set GITHUB_TOKEN (a personal token) to also cover
// public repos that have since uninstalled the GitHub App.

export default async function backfillSnapshots() {
  // astro db execute only loads its own ASTRO_* variables
  if (existsSync('.env')) process.loadEnvFile('.env')

  const { GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, DRY_RUN } = process.env
  if (!GITHUB_APP_ID || !GITHUB_APP_PRIVATE_KEY) {
    throw new Error('Set GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY')
  }
  const dryRun = DRY_RUN === '1'

  const app = new App({
    appId: GITHUB_APP_ID,
    // keys pulled into a .env file often have their newlines escaped
    privateKey: GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n'),
  })

  const pending = await db
    .select()
    .from(Submission)
    .where(isNull(Submission.snapshotUrl))

  const byRepo = new Map<string, typeof pending>()
  for (const submission of pending) {
    const submissions = byRepo.get(submission.submissionRepo) ?? []
    submissions.push(submission)
    byRepo.set(submission.submissionRepo, submissions)
  }

  let saved = 0
  let failed = 0
  let skipped = 0

  for (const [repo, submissions] of byRepo) {
    const octokit = await octokitFor(app, repo)
    if (!octokit) {
      console.log(`- ${repo}: no access, skipping ${submissions.length}`)
      skipped += submissions.length
      continue
    }

    if (dryRun) {
      console.log(`✓ ${repo}: would snapshot ${submissions.length}`)
      saved += submissions.length
      continue
    }

    for (const submission of submissions) {
      try {
        const snapshotUrl = await snapshotSubmission(octokit, {
          projectId: submission.projectId,
          repo,
          sha: submission.commitHash,
        })
        await db
          .update(Submission)
          .set({ snapshotUrl })
          .where(eq(Submission.id, submission.id))
        saved++
      } catch (error) {
        // e.g. the commit was force-pushed away
        const message = error instanceof Error ? error.message : String(error)
        console.error(
          `✗ ${repo}@${submission.commitHash.slice(0, 7)}: ${message}`,
        )
        failed++
      }
    }
    console.log(`✓ ${repo}`)
  }

  console.log(
    `\n${dryRun ? 'Would snapshot' : 'Snapshotted'} ${saved}, failed ${failed}, ` +
      `skipped ${skipped} with no access (of ${pending.length} missing)`,
  )
}

async function octokitFor(app: App, repo: string): Promise<Octokit | null> {
  const [owner, name] = repo.split('/')
  try {
    const { data: installation } =
      await app.octokit.rest.apps.getRepoInstallation({ owner, repo: name })
    return await app.getInstallationOctokit(installation.id)
  } catch {
    // App uninstalled or repo deleted. A personal token still reaches public repos
    if (!process.env.GITHUB_TOKEN) return null
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
    try {
      await octokit.rest.repos.get({ owner, repo: name })
      return octokit
    } catch {
      return null
    }
  }
}
