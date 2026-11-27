import {
  db,
  eq,
  isNull,
  Participant,
  Penalty,
  Repository,
  User,
} from 'astro:db'
import { existsSync } from 'node:fs'
import { liftPenalty } from '../src/lib/competition/data'

// Lifts a penalty, e.g. after an appeal. The penalty stays on record. Run from
// the website root:
//
//   PENALTY_ID=... npx astro db execute db/lift-penalty.ts --remote
//
// Without PENALTY_ID it lists every penalty still in force, with its id.

export default async function liftPenaltyScript() {
  // astro db execute only loads its own ASTRO_* variables
  if (existsSync('.env')) process.loadEnvFile('.env')

  const { PENALTY_ID } = process.env
  if (PENALTY_ID) {
    await liftPenalty(PENALTY_ID)
    console.log(`Lifted penalty ${PENALTY_ID}`)
    return
  }

  const [penalties, repos, people] = await Promise.all([
    db.select().from(Penalty).where(isNull(Penalty.liftedAt)),
    db
      .select({ teamId: Repository.teamId, fullName: Repository.fullName })
      .from(Repository),
    db
      .select({
        id: Participant.id,
        projectId: Participant.projectId,
        name: User.name,
      })
      .from(Participant)
      .innerJoin(User, eq(Participant.userId, User.id)),
  ])
  if (!penalties.length) {
    console.log('No penalties are in force')
    return
  }
  for (const p of penalties) {
    const person = people.find((x) => x.id === p.participantId)
    const target = p.teamId
      ? repos
          .filter((r) => r.teamId === p.teamId)
          .map((r) => r.fullName)
          .join(', ')
      : `${person?.name ?? p.participantId} in ${person?.projectId}`
    const amount = p.points
      ? ` ${p.points}`
      : p.beforeRound
        ? ` before round ${p.beforeRound}`
        : ''
    console.log(
      `${p.id}  ${p.kind}${amount} on ${target}  (${p.createdAt.toISOString().slice(0, 10)}: ${p.reason})`,
    )
  }
}
