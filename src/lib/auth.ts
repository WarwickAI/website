import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db, User, Session, Account, Verification } from 'astro:db'
import { recordLogin } from '@/lib/competition/data'
import { syncUser } from '@/lib/competition/membership-store'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: User,
      session: Session,
      account: Account,
      verification: Verification,
    },
  }),
  socialProviders: {
    github: {
      clientId: import.meta.env.GITHUB_CLIENT_ID as string,
      clientSecret: import.meta.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  // Sign-in is checked on every request, so it's kept in a signed cookie for
  // 5 minutes rather than looked up in the database each time
  session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
  databaseHooks: {
    session: {
      create: {
        // Every sign-in. Neither of these may stop someone signing in
        after: async (session) => {
          try {
            await recordLogin(session)
          } catch (error) {
            console.error('Failed to record login:', error)
          }

          try {
            await syncUser(session.userId)
          } catch (error) {
            console.error('Failed to update teams on sign-in:', error)
          }
        },
      },
    },
  },
})
