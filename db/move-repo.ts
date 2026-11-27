import { db, eq, sql, Repository } from 'astro:db'
import { existsSync } from 'node:fs'
import { moveRepository } from '../src/lib/competition/membership-store'

// Moves a repo, with its submissions and results, to another team, e.g. to merge
// a second repo that db/check-integrity.ts flags. Run from the website root:
//
//   REPO=owner/second-repo TO_TEAM_REPO=owner/first-repo DRY_RUN=1 \
//     npx astro db execute db/move-repo.ts --remote

export default async function moveRepo() {
  // astro db execute only loads its own ASTRO_* variables
  if (existsSync('.env')) process.loadEnvFile('.env')

  const { REPO, TO_TEAM_REPO, DRY_RUN } = process.env
  if (!REPO || !TO_TEAM_REPO)
    throw new Error(
      'Set REPO (the repo to move) and TO_TEAM_REPO (a repo already on the team it joins)',
    )

  const find = async (name: string) => {
    const repos = await db
      .select()
      .from(Repository)
      .where(sql`lower(${Repository.fullName}) = ${name.toLowerCase()}`)
    if (repos.length !== 1) throw new Error(`There's no repo ${name}`)
    return repos[0]
  }
  const repo = await find(REPO)
  const to = await find(TO_TEAM_REPO)
  if (repo.teamId === to.teamId) {
    console.log(`${REPO} is already on that team`)
    return
  }

  const team = await db
    .select({ fullName: Repository.fullName })
    .from(Repository)
    .where(eq(Repository.teamId, to.teamId))
  console.log(
    `Moving ${repo.fullName} to the team of ${team.map((r) => r.fullName).join(', ')}`,
  )
  if (DRY_RUN === '1') {
    console.log('\nDry run, so nothing was moved')
    return
  }
  await moveRepository(repo.id, to.teamId)
  console.log('Moved')
}
