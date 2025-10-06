import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import {
  db,
  User,
  Session,
  Account,
  Verification,
  Contribution,
  eq,
  and,
  isNull,
} from 'astro:db'

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
  databaseHooks: {
    account: {
      create: {
        after: async (account, _) => {
          if (account.providerId !== 'github') return

          try {
            await db
              .update(Contribution)
              .set({
                userId: account.userId,
                linkedAt: new Date(),
              })
              .where(
                and(
                  eq(Contribution.githubUserId, parseInt(account.id)),
                  isNull(Contribution.userId),
                ),
              )
          } catch (error) {
            console.error(`Failed to link contributions:`, error)
          }
        },
      },
    },
  },
})
