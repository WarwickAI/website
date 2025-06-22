import { betterAuth } from 'better-auth'
import Database from 'better-sqlite3'

export const auth = betterAuth({
  database: new Database('sqlite.db'),
  socialProviders: {
    github: {
      // NOTE: Might need to use process.env in prod
      clientId: import.meta.env.GITHUB_CLIENT_ID as string,
      clientSecret: import.meta.env.GITHUB_CLIENT_SECRET as string,
    },
  },
})
