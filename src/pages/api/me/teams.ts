import type { APIRoute } from 'astro'
import { auth } from '@/lib/auth'
import { myTeams } from '@/lib/competition/account'
import { needsAttention } from '@/lib/competition/membership'

export const prerender = false

// The signed-in person's teams, for the account popover
export const GET: APIRoute = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session)
    return Response.json({ error: 'Sign in first' }, { status: 401 })

  const teams = await myTeams(session.user.id)
  return Response.json(
    {
      teams: teams.map((team) => ({
        ...team,
        needsAttention: needsAttention(team),
      })),
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
