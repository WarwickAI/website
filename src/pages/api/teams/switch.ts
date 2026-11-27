import type { APIRoute } from 'astro'
import { auth } from '@/lib/auth'
import { switchTeam } from '@/lib/competition/membership-store'

export const prerender = false

// Only takes JSON, so a form on another site can't send it
export const POST: APIRoute = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session)
    return Response.json({ error: 'Sign in first' }, { status: 401 })
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return Response.json({ error: 'Expected JSON' }, { status: 415 })
  }

  const body = (await request.json().catch(() => null)) as {
    projectId?: unknown
    teamId?: unknown
  } | null
  if (typeof body?.projectId !== 'string' || typeof body.teamId !== 'string') {
    return Response.json(
      { error: 'Expected a projectId and a teamId' },
      { status: 400 },
    )
  }

  try {
    await switchTeam(session.user.id, body.projectId, body.teamId)
    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 })
  }
}
