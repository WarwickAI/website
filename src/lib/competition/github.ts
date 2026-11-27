import { App, type Octokit } from 'octokit'

let app: App | undefined

// The WarwickAI GitHub App, made on first use. Scripts run by
// `astro db execute` only have process.env
export function githubApp(): App {
  app ??= new App({
    appId: import.meta.env?.GITHUB_APP_ID ?? process.env.GITHUB_APP_ID,
    privateKey: (
      import.meta.env?.GITHUB_APP_PRIVATE_KEY ??
      process.env.GITHUB_APP_PRIVATE_KEY
    )?.replace(/\\n/g, '\n'),
    webhooks: {
      secret:
        import.meta.env?.GITHUB_WEBHOOK_SECRET ??
        process.env.GITHUB_WEBHOOK_SECRET ??
        '',
    },
  })
  return app
}

// GitHub ids of everyone who can push: collaborators, and an owner who's a person
export async function listCollaborators(
  octokit: Octokit,
  repo: { owner: string; name: string; ownerType: string; ownerId: number },
): Promise<string[]> {
  const collaborators = await octokit.paginate(
    octokit.rest.repos.listCollaborators,
    {
      owner: repo.owner,
      repo: repo.name,
      affiliation: 'direct',
      per_page: 100,
    },
  )
  const ids = new Set(collaborators.map((c) => String(c.id)))
  if (repo.ownerType === 'User') ids.add(String(repo.ownerId))
  return [...ids]
}

export interface InstalledRepo {
  id: number
  name: string
  full_name: string
  owner: { login: string; id: number; type: string }
  fork: boolean
  is_template?: boolean
}

// Runs `handle` on each repo, a few at a time, skipping forks and templates.
// Failures don't stop the rest, and are returned
export async function forEachInstalledRepo(
  installationIds: number[],
  reposOf: (installationId: number) => Promise<InstalledRepo[]>,
  handle: (installationId: number, repo: InstalledRepo) => Promise<void>,
  concurrency = 4,
): Promise<{ what: string; error: unknown }[]> {
  const failures: { what: string; error: unknown }[] = []
  const work: (() => Promise<void>)[] = []

  const listed = await Promise.all(
    installationIds.map((installationId) =>
      reposOf(installationId).then(
        (repos) => ({ installationId, repos }),
        (error: unknown) => {
          failures.push({ what: `installation ${installationId}`, error })
          return { installationId, repos: [] }
        },
      ),
    ),
  )
  for (const { installationId, repos } of listed) {
    for (const repo of repos) {
      if (repo.fork || repo.is_template) continue
      work.push(() =>
        handle(installationId, repo).catch((error: unknown) => {
          failures.push({ what: repo.full_name, error })
        }),
      )
    }
  }

  const queue = [...work]
  await Promise.all(
    Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      for (let next = queue.shift(); next; next = queue.shift()) await next()
    }),
  )
  return failures
}
