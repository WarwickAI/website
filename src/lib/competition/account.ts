import { Octokit } from 'octokit'
import { auth } from '../auth'
import { loadCompetition, projectsOfUser, findProject } from './data'
import {
  githubApp,
  listCollaborators,
  forEachInstalledRepo,
  type InstalledRepo,
} from './github'
import {
  projectOfRepository,
  recordRepository,
  syncUser,
} from './membership-store'
import {
  commitAuthorsToSuggest,
  summariseMyTeam,
  type MyTeam,
} from './membership'
import { teamStatuses } from './team-status'

// Server side of /account and the popover's "Your teams"

// With what only GitHub knows: teammates' usernames and people to suggest
export type AccountTeam = MyTeam & {
  unclaimedLogins: string[]
  suggestedLogins: string[]
}

// As stored, for showing straight away
export async function storedTeams(userId: string): Promise<AccountTeam[]> {
  return (await myTeams(userId)).map((team) => ({
    ...team,
    unclaimedLogins: [],
    suggestedLogins: [],
  }))
}

// Brings someone's teams up to date with GitHub: an installation they just
// made, who can push now, and the usernames and suggestions. teams is null if
// they couldn't be loaded
export async function syncWithGithub(
  userId: string,
  headers: Headers,
  installationId: number | null,
): Promise<{ teams: AccountTeam[] | null; problem: string | null }> {
  let problem: string | null = null
  try {
    if (installationId) {
      const result = await joinFromInstallation(userId, installationId, headers)
      if (!result.ok) problem = result.reason
    }
    await refreshMyRepos(userId, headers)
    await syncUser(userId)
  } catch (error) {
    console.error('Error syncing with GitHub:', error)
    problem ??= 'Something went wrong talking to GitHub. Try again.'
  }

  try {
    const mine = await myTeams(userId)
    const [logins, suggestions] = await Promise.all([
      githubLogins(userId, headers, [
        ...new Set(mine.flatMap((t) => t.unclaimedGithubUserIds)),
      ]),
      suggestedTeammates(mine),
    ])
    const teams = mine.map((team) => ({
      ...team,
      unclaimedLogins: team.unclaimedGithubUserIds
        .map((id) => logins.get(id))
        .filter((login): login is string => !!login),
      suggestedLogins: suggestions.get(team.projectId) ?? [],
    }))
    return { teams, problem }
  } catch (error) {
    console.error('Error loading teams:', error)
    return {
      teams: null,
      problem: problem ?? "We couldn't load your teams. Try again.",
    }
  }
}

// Running competitions first
export async function myTeams(
  userId: string,
  now = new Date(),
): Promise<MyTeam[]> {
  const teams: (MyTeam & { running: boolean; startDate: number })[] = []
  for (const projectId of await projectsOfUser(userId)) {
    const data = await loadCompetition(projectId)
    teams.push({
      ...summariseMyTeam(data, teamStatuses(data, now), userId, now),
      running: !data.project.endDate || now <= data.project.endDate,
      startDate: data.project.startDate.getTime(),
    })
  }
  return teams
    .sort(
      (a, b) =>
        Number(b.running) - Number(a.running) || b.startDate - a.startDate,
    )
    .map(({ running: _running, startDate: _startDate, ...team }) => team)
}

// Their own GitHub token, which only sees what they can
async function userOctokit(
  userId: string,
  headers: Headers,
): Promise<Octokit | null> {
  try {
    const { accessToken } = await auth.api.getAccessToken({
      body: { providerId: 'github', userId },
      headers,
    })
    return accessToken ? new Octokit({ auth: accessToken }) : null
  } catch (error) {
    console.error('Error getting a GitHub token:', error)
    return null
  }
}

async function recordInstalledRepo(
  installationId: number,
  repo: InstalledRepo,
  projectId?: string,
) {
  const app = await githubApp().getInstallationOctokit(installationId)
  const project =
    projectId ?? (await findProject(app, repo.owner.login, repo.name))?.id
  if (!project) return

  let collaborators: string[] | null = null
  try {
    collaborators = await listCollaborators(app, {
      owner: repo.owner.login,
      name: repo.name,
      ownerType: repo.owner.type,
      ownerId: repo.owner.id,
    })
  } catch (error) {
    console.error(`Error fetching collaborators of ${repo.full_name}:`, error)
  }
  await recordRepository({
    projectId: project,
    githubRepoId: repo.id,
    fullName: repo.full_name,
    ownerGithubUserId: String(repo.owner.id),
    collaborators,
  })
}

const reposFor = (user: Octokit) => (installationId: number) =>
  user.paginate(user.rest.apps.listInstallationReposForAuthenticatedUser, {
    installation_id: installationId,
    per_page: 100,
  })

// Records the repos of an installation they just made. The id in GitHub's
// redirect can be faked, so it's only trusted if their own token can see it
export async function joinFromInstallation(
  userId: string,
  installationId: number,
  headers: Headers,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await userOctokit(userId, headers)
  if (!user)
    return {
      ok: false,
      reason: "We couldn't reach GitHub as you. Try logging out and in again.",
    }

  const installations = await user.paginate(
    user.rest.apps.listInstallationsForAuthenticatedUser,
    { per_page: 100 },
  )
  if (!installations.some((i) => i.id === installationId)) {
    return {
      ok: false,
      reason:
        "We couldn't find that WarwickAI app installation on your GitHub account, so nothing was added. If you installed it from a different GitHub account, log out and sign in with that one.",
    }
  }

  const failures = await forEachInstalledRepo(
    [installationId],
    reposFor(user),
    (id, repo) => recordInstalledRepo(id, repo),
  )
  for (const { what, error } of failures)
    console.error(`Error recording ${what}:`, error)
  await syncUser(userId)
  if (failures.length) {
    return {
      ok: false,
      reason:
        "Some of your repositories couldn't be checked with GitHub, so a team may be missing. Refresh the page to try again.",
    }
  }
  return { ok: true }
}

// Updates who can push to the repos we know of, so new teammates join and
// holds lift without waiting for a push
export async function refreshMyRepos(
  userId: string,
  headers: Headers,
): Promise<void> {
  const user = await userOctokit(userId, headers)
  if (!user) return

  const installations = await user.paginate(
    user.rest.apps.listInstallationsForAuthenticatedUser,
    { per_page: 100 },
  )
  const failures = await forEachInstalledRepo(
    installations.map((i) => i.id),
    reposFor(user),
    async (installationId, repo) => {
      const projectId = await projectOfRepository(repo.id)
      if (projectId) await recordInstalledRepo(installationId, repo, projectId)
    },
  )
  for (const { what, error } of failures)
    console.error(`Error refreshing ${what}:`, error)
}

// GitHub usernames for ids, leaving out any GitHub can't find
export async function githubLogins(
  userId: string,
  headers: Headers,
  ids: string[],
): Promise<Map<string, string>> {
  const logins = new Map<string, string>()
  if (!ids.length) return logins
  const user = await userOctokit(userId, headers)
  if (!user) return logins
  await Promise.all(
    ids.map(async (id) => {
      try {
        const { data } = await user.request('GET /user/{account_id}', {
          account_id: Number(id),
        })
        logins.set(id, data.login)
      } catch {}
    }),
  )
  return logins
}

// By projectId, people with commits who can't push to the team's repo
export async function suggestedTeammates(
  teams: MyTeam[],
): Promise<Map<string, string[]>> {
  const suggestions = new Map<string, string[]>()
  const templateAuthors = new Map<string, Promise<Set<string>>>()
  const app = githubApp()

  await Promise.all(
    teams.map(async (team) => {
      if (!team.teamId || !team.repoFullName) return
      try {
        const [owner, name] = team.repoFullName.split('/')
        const { data: installation } =
          await app.octokit.rest.apps.getRepoInstallation({ owner, repo: name })
        const kit = await app.getInstallationOctokit(installation.id)
        const { data: repo } = await kit.rest.repos.get({ owner, repo: name })

        if (!templateAuthors.has(team.templateRepo)) {
          const [templateOwner, templateName] = team.templateRepo.split('/')
          templateAuthors.set(
            team.templateRepo,
            kit
              .paginate(kit.rest.repos.listContributors, {
                owner: templateOwner,
                repo: templateName,
                per_page: 100,
              })
              .then((people) => new Set(people.map((p) => String(p.id))))
              .catch(() => new Set<string>()),
          )
        }

        const [contributors, collaborators, template] = await Promise.all([
          kit.paginate(kit.rest.repos.listContributors, {
            owner,
            repo: name,
            per_page: 100,
          }),
          listCollaborators(kit, {
            owner,
            name,
            ownerType: repo.owner.type,
            ownerId: repo.owner.id,
          }),
          templateAuthors.get(team.templateRepo)!,
        ])
        const suggested = commitAuthorsToSuggest(
          contributors,
          new Set(collaborators),
          template,
        )
        if (suggested.length)
          suggestions.set(
            team.projectId,
            suggested.map((s) => s.login),
          )
      } catch (error) {
        // 404: the app has been removed from the repo
        if ((error as { status?: number }).status === 404) return
        console.error(
          `Error suggesting teammates for ${team.repoFullName}:`,
          error,
        )
      }
    }),
  )
  return suggestions
}

// Their GitHub username, or null if GitHub can't be asked
export async function githubLogin(
  userId: string,
  headers: Headers,
): Promise<string | null> {
  const user = await userOctokit(userId, headers)
  if (!user) return null
  try {
    return (await user.rest.users.getAuthenticated()).data.login
  } catch {
    return null
  }
}
