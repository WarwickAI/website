import { loadEverything } from '../src/lib/competition/data'
import { checkIntegrity } from '../src/lib/competition/integrity'

// Checks the rules at the top of db/config.ts. Only reads. Run it before each
// round, from the website root:
//
//   npx astro db execute db/check-integrity.ts --remote
//
// Problems must be fixed, and make this fail. Flags are worth a look.

export default async function checkIntegrityScript() {
  const { problems, flags } = checkIntegrity(await loadEverything(), new Date())

  for (const flag of flags) console.log(`Flag: ${flag}`)
  if (problems.length) {
    throw new Error(
      `${problems.length} problem${problems.length === 1 ? '' : 's'}:\n  ${problems.join('\n  ')}`,
    )
  }
  console.log(
    `No problems${flags.length ? `, ${flags.length} flag${flags.length === 1 ? '' : 's'} to look at` : ''}`,
  )
}
