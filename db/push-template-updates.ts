import { db, Project } from 'astro:db'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { App, Octokit } from 'octokit'

// Brings every team's repo for a project up to date with the project's
// template, by committing the template's latest files through the GitHub App.
// Run from the website root:
//
//   PROJECT_ID=poker STUDENT_FILES="myAI.py" DRY_RUN=1 \
//     npx astro db execute db/push-template-updates.ts --remote
//
// Reads GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY from .env (or the shell,
// which wins).
//
// - STUDENT_FILES are the template files teams are meant to edit, which are
//   never touched (the same list as the competitions repo's results/run.sh)
// - DRY_RUN=1 only prints what each repo would get
// - REPOS="owner/name ..." only updates those repos, e.g. to try it on your
//   own first
// - BRANCH=name commits to that branch instead of the default one, for teams
//   to merge themselves
//
// Template files a team hasn't changed are replaced with the latest version.
// Ones they have changed are merged with the template's changes since the repo
// was made, and if any of those merges conflict the whole repo is left alone
// and listed at the end to sort out by hand. The app can't change
// .github/workflows, so out of date workflows are only listed.
//
// Pushes from the app trigger workflows, so every updated repo is scored again.

type Entry = { mode: string; sha: string }
type Tree = Map<string, Entry>

type Template = {
  repo: string
  head: string
  latest: Tree
  // Newest first, following the default branch, which is what repos are made from
  commits: { commit: string; tree: string; time: number }[]
  trees: Map<string, Tree>
  // Every version each path has had
  versions: Map<string, Set<string>>
  blob: (sha: string) => Buffer
}

type Change = {
  path: string
  mode: string
  content: Buffer | null // null deletes it
  merged: boolean
}

export default async function pushTemplateUpdates() {
  // astro db execute only loads its own ASTRO_* variables
  if (existsSync('.env')) process.loadEnvFile('.env')

  const { GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, STUDENT_FILES, BRANCH } =
    process.env
  if (!GITHUB_APP_ID || !GITHUB_APP_PRIVATE_KEY) {
    throw new Error('Set GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY')
  }
  if (STUDENT_FILES === undefined) {
    throw new Error(
      'Set STUDENT_FILES to the template files teams edit, e.g. "myAI.py" (or "" for none)',
    )
  }
  const studentFiles = new Set(STUDENT_FILES.split(/\s+/).filter(Boolean))
  const onlyRepos = process.env.REPOS
    ? new Set(process.env.REPOS.toLowerCase().split(/\s+/).filter(Boolean))
    : null
  const dryRun = process.env.DRY_RUN === '1'

  const projects = await db.select().from(Project)
  const project = projects.find((p) => p.id === process.env.PROJECT_ID)
  if (!project) {
    throw new Error(
      `Set PROJECT_ID to one of: ${projects.map((p) => p.id).join(', ')}`,
    )
  }

  const app = new App({
    appId: GITHUB_APP_ID,
    // keys pulled into a .env file often have their newlines escaped
    privateKey: GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n'),
  })

  // Repos made from the template can't be older than it, which saves looking
  // up every other repo the app can see
  const [templateOwner, templateName] = project.templateRepo.split('/')
  const { data: templateInfo } = await new Octokit({
    auth: process.env.GITHUB_TOKEN,
  }).rest.repos.get({ owner: templateOwner, repo: templateName })
  const templateCreated = new Date(templateInfo.created_at)

  const scratch = mkdtempSync(path.join(tmpdir(), 'template-updates-'))
  try {
    const template = loadTemplate(project.templateRepo, scratch)
    console.log(`Template: ${template.repo}@${template.head.slice(0, 7)}\n`)

    let updated = 0
    let upToDate = 0
    const attention: string[] = []

    for await (const { octokit, repository } of appRepositories(app)) {
      if (repository.fork || repository.archived || repository.is_template) {
        continue
      }
      if (onlyRepos && !onlyRepos.has(repository.full_name.toLowerCase())) {
        continue
      }
      if (
        !repository.created_at ||
        new Date(repository.created_at) < templateCreated
      ) {
        continue
      }

      const owner = repository.owner.login
      const repo = repository.name
      const name = repository.full_name
      try {
        const { data: full } = await octokit.rest.repos.get({ owner, repo })
        if (
          full.template_repository?.full_name.toLowerCase() !==
          template.repo.toLowerCase()
        ) {
          continue
        }

        const result = await updateRepo(octokit, {
          owner,
          repo,
          defaultBranch: full.default_branch,
          createdAt: new Date(full.created_at),
          template,
          studentFiles,
          branch: BRANCH,
          dryRun,
          scratch,
        })

        for (const workflow of result.workflows) {
          attention.push(
            `${name}: ${workflow} is out of date, and the app can't change workflows`,
          )
        }

        if (result.conflicts.length) {
          console.log(
            `✗ ${name}: left alone, conflicts in (made from ${result.base.slice(0, 7)}):`,
          )
          for (const file of result.conflicts) console.log(`    ${file}`)
          attention.push(`${name}: conflicts in ${result.conflicts.join(', ')}`)
        } else if (result.changes.length) {
          console.log(
            `✓ ${name}: ${dryRun ? 'would update' : 'updated'} ` +
              `${result.changes.length} (made from ${result.base.slice(0, 7)})`,
          )
          for (const change of result.changes) {
            const action =
              change.content === null
                ? 'remove'
                : change.merged
                  ? 'merge '
                  : 'update'
            console.log(`    ${action} ${change.path}`)
          }
          updated++
        } else {
          console.log(`= ${name}: up to date`)
          upToDate++
        }
      } catch (error) {
        // e.g. an empty or deleted repo, or the team pushed while this was running
        const message = error instanceof Error ? error.message : String(error)
        console.error(`✗ ${name}: ${message}`)
        attention.push(`${name}: ${message}`)
      }
    }

    console.log(
      `\n${dryRun ? 'Would update' : 'Updated'} ${updated}, ${upToDate} already up to date`,
    )
    if (attention.length) {
      console.log(`\nNeeds sorting out by hand:`)
      for (const line of attention) console.log(`  ${line}`)
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true })
  }
}

// Every repo the app can see. eachRepository stops at the first suspended
// installation, so this skips them instead
async function* appRepositories(app: App) {
  for await (const {
    octokit,
    installation,
  } of app.eachInstallation.iterator()) {
    if (installation.suspended_at) {
      const account = installation.account
      const name =
        account && 'login' in account ? account.login : installation.id
      console.log(`- ${name}: app suspended, skipping its repos`)
      continue
    }

    for await (const { data: repositories } of octokit.paginate.iterator(
      octokit.rest.apps.listReposAccessibleToInstallation,
      { per_page: 100 },
    )) {
      for (const repository of repositories) yield { octokit, repository }
    }
  }
}

async function updateRepo(
  octokit: Octokit,
  options: {
    owner: string
    repo: string
    defaultBranch: string
    createdAt: Date
    template: Template
    studentFiles: Set<string>
    branch: string | undefined
    dryRun: boolean
    scratch: string
  },
) {
  const { owner, repo, defaultBranch, template } = options

  const { data: ref } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
  })
  const headSha = ref.object.sha
  const { data: head } = await octokit.rest.git.getCommit({
    owner,
    repo,
    commit_sha: headSha,
  })
  const { data: headTree } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: head.tree.sha,
    recursive: 'true',
  })
  if (headTree.truncated) throw new Error('too many files to read its tree')

  const ours: Tree = new Map()
  for (const entry of headTree.tree) {
    if (entry.type === 'blob' && entry.path && entry.sha && entry.mode) {
      ours.set(entry.path, { mode: entry.mode, sha: entry.sha })
    }
  }

  const base = await findBase(octokit, options)

  const changes: Change[] = []
  const conflicts: string[] = []
  const workflows: string[] = []

  const files = [...template.versions.keys()].sort()
  for (const file of files) {
    if (options.studentFiles.has(file)) continue

    const mine = ours.get(file)
    const original = base.tree.get(file)
    const latest = template.latest.get(file)
    const action = decide(mine, original, latest, template.versions.get(file)!)
    if (action === 'keep') continue

    if (file.startsWith('.github/workflows/')) {
      workflows.push(file)
      continue
    }

    if (action === 'conflict') {
      conflicts.push(`${file} (added by both the team and the template)`)
      continue
    }

    if (action === 'take') {
      changes.push({
        path: file,
        mode: latest?.mode ?? mine!.mode,
        content: latest ? template.blob(latest.sha) : null,
        merged: false,
      })
      continue
    }

    const { data: blob } = await octokit.rest.git.getBlob({
      owner,
      repo,
      file_sha: mine!.sha,
    })
    const merged = mergeFiles(
      options.scratch,
      template.blob(original!.sha),
      Buffer.from(blob.content, 'base64'),
      template.blob(latest!.sha),
    )
    if (merged) {
      changes.push({
        path: file,
        mode: mine!.mode,
        content: merged,
        merged: true,
      })
    } else {
      conflicts.push(file)
    }
  }

  const result = { changes, conflicts, workflows, base: base.commit }
  if (options.dryRun || conflicts.length || !changes.length) return result

  const tree = []
  for (const change of changes) {
    const mode = change.mode as '100644' | '100755' | '120000'
    if (change.content === null) {
      tree.push({ path: change.path, mode, type: 'blob' as const, sha: null })
      continue
    }
    const { data: blob } = await octokit.rest.git.createBlob({
      owner,
      repo,
      content: change.content.toString('base64'),
      encoding: 'base64',
    })
    tree.push({ path: change.path, mode, type: 'blob' as const, sha: blob.sha })
  }

  const { data: newTree } = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: head.tree.sha,
    tree,
  })
  const { data: commit } = await octokit.rest.git.createCommit({
    owner,
    repo,
    message: commitMessage(template, changes),
    tree: newTree.sha,
    parents: [headSha],
  })

  if (options.branch) {
    try {
      await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${options.branch}`,
        sha: commit.sha,
      })
    } catch {
      // Left over from an earlier run, and only ever written by this script
      await octokit.rest.git.updateRef({
        owner,
        repo,
        ref: `heads/${options.branch}`,
        sha: commit.sha,
        force: true,
      })
    }
  } else {
    // Not forced, so a push from the team since headSha was read fails this
    // rather than being lost
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
      sha: commit.sha,
    })
  }

  return result
}

// What to do with one template file, from the repo's copy, the template's copy
// when the repo was made, the template's latest copy and every version the
// template has had
function decide(
  mine: Entry | undefined,
  original: Entry | undefined,
  latest: Entry | undefined,
  versions: Set<string>,
): 'keep' | 'take' | 'merge' | 'conflict' {
  if (mine?.sha === latest?.sha) return 'keep'

  // Either new in the template since the repo was made, or deleted by the
  // team, in which case it only comes back if the template has changed it
  if (!mine) return original?.sha === latest?.sha ? 'keep' : 'take'

  // Never changed by the team, just out of date
  if (versions.has(mine.sha)) return 'take'

  // Changed by the team, so leave it unless the template has changed it too
  if (!latest || original?.sha === latest.sha) return 'keep'
  return original ? 'merge' : 'conflict'
}

// The template commit a repo was made from
async function findBase(
  octokit: Octokit,
  options: {
    owner: string
    repo: string
    defaultBranch: string
    createdAt: Date
    template: Template
  },
): Promise<{ commit: string; tree: Tree }> {
  const { owner, repo, defaultBranch, template } = options

  // A repo made from a template starts with a copy of its files, so its first
  // commit has the same tree as the template commit it was made from
  const newest = await octokit.rest.repos.listCommits({
    owner,
    repo,
    sha: defaultBranch,
    per_page: 1,
  })
  const lastPage = newest.headers.link?.match(/[?&]page=(\d+)>; rel="last"/)
  const oldest = lastPage
    ? await octokit.rest.repos.listCommits({
        owner,
        repo,
        sha: defaultBranch,
        per_page: 1,
        page: Number(lastPage[1]),
      })
    : newest
  const rootTree = oldest.data[0]?.commit.tree.sha
  let match = template.commits.find((c) => c.tree === rootTree)

  // Otherwise (e.g. the team rewrote their history), what the template was
  // when the repo was made
  match ??= template.commits.find((c) => c.time <= options.createdAt.getTime())

  return match
    ? { commit: match.commit, tree: template.trees.get(match.tree)! }
    : { commit: 'nothing', tree: new Map() }
}

function loadTemplate(repo: string, scratch: string): Template {
  const dir = path.join(scratch, 'template.git')
  execFileSync(
    'git',
    ['clone', '--quiet', '--bare', `https://github.com/${repo}.git`, dir],
    { env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, stdio: 'inherit' },
  )
  const git = (...args: string[]) =>
    execFileSync('git', ['-C', dir, ...args], { maxBuffer: 1 << 30 })

  const commits = git('log', '--first-parent', '--format=%H %T %ct', 'HEAD')
    .toString()
    .trim()
    .split('\n')
    .map((line) => {
      const [commit, tree, time] = line.split(' ')
      return { commit, tree, time: Number(time) * 1000 }
    })

  const trees = new Map<string, Tree>()
  const versions = new Map<string, Set<string>>()
  for (const { tree } of commits) {
    if (trees.has(tree)) continue

    const entries: Tree = new Map()
    for (const line of git('ls-tree', '-r', '-z', tree)
      .toString()
      .split('\0')) {
      const match = line.match(/^(\d+) blob ([0-9a-f]+)\t(.+)$/s)
      if (!match) continue
      const [, mode, sha, file] = match
      entries.set(file, { mode, sha })
      if (!versions.has(file)) versions.set(file, new Set())
      versions.get(file)!.add(sha)
    }
    trees.set(tree, entries)
  }

  return {
    repo,
    head: commits[0].commit,
    latest: trees.get(commits[0].tree)!,
    commits,
    trees,
    versions,
    blob: (sha) => git('cat-file', 'blob', sha),
  }
}

// A three-way merge of a team's changes to a template file with the
// template's, or null if they conflict
function mergeFiles(
  scratch: string,
  original: Buffer,
  mine: Buffer,
  latest: Buffer,
): Buffer | null {
  if ([original, mine, latest].some((content) => content.includes(0))) {
    return null // binary
  }

  const files = { original, mine, latest }
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(path.join(scratch, name), content)
  }
  const result = spawnSync(
    'git',
    ['merge-file', '-p', 'mine', 'original', 'latest'],
    { cwd: scratch, maxBuffer: 1 << 30 },
  )
  // The exit code is the number of conflicts
  return result.status === 0 ? result.stdout : null
}

function commitMessage(template: Template, changes: Change[]): string {
  const lines = changes.map(
    (change) =>
      `- ${change.path}${change.content === null ? ' (removed)' : change.merged ? ' (merged with your changes)' : ''}`,
  )
  return [
    'Update competition files from the template',
    '',
    `Brings these files up to date with ${template.repo}@${template.head.slice(0, 7)}:`,
    '',
    ...lines,
  ].join('\n')
}
