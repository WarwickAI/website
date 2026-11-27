import { db, sql } from 'astro:db'

// Prints which database astro:db is connected to, and its tables. Run it before
// anything that writes, with the same environment:
//
//   ASTRO_DB_REMOTE_URL=file:/path/to/new.db npx astro db execute db/where.ts --remote

export default async function where() {
  const url = process.env.ASTRO_DB_REMOTE_URL ?? '(not set)'
  // Only the scheme and host, as a file path or query string could hold secrets
  const shown = url.startsWith('file:')
    ? url
    : url.replace(/^(\w+:\/\/[^/?]+).*$/, '$1')
  const result = await db.run(
    sql`select name from sqlite_master where type = 'table' and name not like 'sqlite_%' order by name`,
  )
  const tables = result.rows.map((row) =>
    String((row as Record<string, unknown>).name),
  )
  console.log(`Connected to: ${shown}`)
  console.log(
    tables.length
      ? `Tables (${tables.length}): ${tables.join(', ')}`
      : 'No tables',
  )
}
