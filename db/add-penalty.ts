import {
  db,
  eq,
  and,
  sql,
  Account,
  Participant,
  Repository,
  Team,
} from 'astro:db'
import { existsSync } from 'node:fs'
import { githubApp } from '../src/lib/competition/github'
import { validatePenalty, type NewPenalty } from '../src/lib/competition/model'
import { addPenalty } from '../src/lib/competition/data'

// Adds a penalty to a team or a person in one competition. Run from the
// website root, with DRY_RUN=1 first:
//
//   PROJECT_ID=poker TEAM_REPO=owner/repo KIND=points POINTS=7500 REASON="..." DRY_RUN=1 \
//     npx astro db execute db/add-penalty.ts --remote
//
// - TEAM_REPO is any repo of the team, or PERSON is someone's GitHub username
//   (or id), for a penalty that follows them to any team in the competition
// - KIND is dsq (shown at the bottom as DSQ), hidden, void (with BEFORE_ROUND,
//   rounds before it don't count), points (with POINTS, taken off the total)
//   or ineligible (can't win a prize). A person can only get dsq, hidden or
//   ineligible
// - REASON is private. PUBLIC_NOTE, if set, is shown on the leaderboard
//
// Undo one with db/lift-penalty.ts.

export default async function addPenaltyScript() {
  // astro db execute only loads its own ASTRO_* variables
  if (existsSync('.env')) process.loadEnvFile('.env')

  const {
    PROJECT_ID,
    TEAM_REPO,
    PERSON,
    KIND,
    POINTS,
    BEFORE_ROUND,
    REASON,
    PUBLIC_NOTE,
    DRY_RUN,
  } = process.env
  if (!PROJECT_ID) throw new Error('Set PROJECT_ID')
  if (!TEAM_REPO === !PERSON)
    throw new Error(
      'Set one of TEAM_REPO (a repo of the team) or PERSON (a GitHub username)',
    )

  const penalty: NewPenalty = {
    kind: KIND ?? '',
    reason: REASON ?? '',
    ...(POINTS !== undefined && { points: Number(POINTS) }),
    ...(BEFORE_ROUND !== undefined && { beforeRound: Number(BEFORE_ROUND) }),
    ...(PUBLIC_NOTE && { publicNote: PUBLIC_NOTE }),
  }

  let target: string
  if (TEAM_REPO) {
    const teams = await db
      .select({ teamId: Team.id, fullName: Repository.fullName })
      .from(Repository)
      .innerJoin(Team, eq(Repository.teamId, Team.id))
      .where(
        and(
          eq(Team.projectId, PROJECT_ID),
          sql`lower(${Repository.fullName}) = ${TEAM_REPO.toLowerCase()}`,
        ),
      )
    if (teams.length !== 1)
      throw new Error(`There's no repo ${TEAM_REPO} in ${PROJECT_ID}`)
    penalty.teamId = teams[0].teamId
    const repos = await db
      .select({ fullName: Repository.fullName })
      .from(Repository)
      .where(eq(Repository.teamId, teams[0].teamId))
    target = `the team of ${repos.map((r) => r.fullName).join(', ')}`
  } else {
    const githubUserId = await githubIdOf(PERSON!)
    const participant = await db
      .select({ id: Participant.id })
      .from(Participant)
      .innerJoin(
        Account,
        and(
          eq(Account.userId, Participant.userId),
          eq(Account.providerId, 'github'),
        ),
      )
      .where(
        and(
          eq(Participant.projectId, PROJECT_ID),
          eq(Account.accountId, githubUserId),
        ),
      )
      .get()
    if (!participant) {
      throw new Error(
        `${PERSON} isn't in ${PROJECT_ID}: they've never signed in, or never been on a team. Penalise their team instead`,
      )
    }
    penalty.participantId = participant.id
    target = `${PERSON} (GitHub ${githubUserId}), on any team in ${PROJECT_ID}`
  }

  const problems = validatePenalty(penalty)
  if (problems.length) throw new Error(problems.join('\n'))

  const amount = penalty.points
    ? ` of ${penalty.points} points`
    : penalty.beforeRound
      ? ` voiding rounds before ${penalty.beforeRound}`
      : ''
  console.log(`${penalty.kind}${amount} on ${target}`)
  console.log(`Reason (private): ${penalty.reason}`)
  if (penalty.publicNote)
    console.log(`Shown on the leaderboard: ${penalty.publicNote}`)

  if (DRY_RUN === '1') {
    console.log('\nDry run, so nothing was added')
    return
  }
  console.log(`\nAdded penalty ${await addPenalty(penalty)}`)
}

// Through an installation, as the app itself can't look up users
async function githubIdOf(person: string): Promise<string> {
  if (/^\d+$/.test(person)) return person
  const app = githubApp()
  const { data: installations } = await app.octokit.rest.apps.listInstallations(
    { per_page: 1 },
  )
  if (!installations.length)
    throw new Error(
      'The GitHub App has no installations to look people up with',
    )
  const octokit = await app.getInstallationOctokit(installations[0].id)
  const { data } = await octokit.rest.users.getByUsername({ username: person })
  return String(data.id)
}
