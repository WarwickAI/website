import type { APIRoute } from 'astro'
import { auth } from '@/lib/auth'
import { syncWithGithub } from '@/lib/competition/account'

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
    installationId?: unknown
  } | null
  const installationId =
    typeof body?.installationId === 'number' ? body.installationId : null

  return Response.json(
    await syncWithGithub(session.user.id, request.headers, installationId),
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
