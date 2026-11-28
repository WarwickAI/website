import { useEffect, useState } from 'react'
import { needsAttention, type MyTeam } from './membership'

export type MyTeamWithAttention = MyTeam & { needsAttention: boolean }

// Shared by the profile photo, the popover and /account: shown at once from the
// last answer, and fetched again on every page so it's never stale for long
let teams: MyTeamWithAttention[] | null = null
let request: Promise<void> | null = null
const listeners = new Set<(teams: MyTeamWithAttention[]) => void>()

function publish(next: MyTeamWithAttention[]) {
  teams = next
  for (const listener of listeners) listener(next)
}

function load() {
  // A failed fetch keeps the last answer, and the next page tries again
  request ??= fetch('/api/me/teams')
    .then((response) => (response.ok ? response.json() : null))
    .then((body: { teams: MyTeamWithAttention[] } | null) => {
      if (body) publish(body.teams)
    })
    .catch(() => {})
    .finally(() => {
      request = null
    })
}

// Fresher teams from elsewhere, such as /account's sync with GitHub
export function setMyTeams(next: MyTeam[]) {
  publish(
    next.map((team) => ({ ...team, needsAttention: needsAttention(team) })),
  )
}

export function useMyTeams(signedIn: boolean): MyTeamWithAttention[] | null {
  // Starts empty, as on the server, so hydrating matches what it rendered
  const [current, setCurrent] = useState<MyTeamWithAttention[] | null>(null)

  useEffect(() => {
    if (!signedIn) return
    listeners.add(setCurrent)
    if (teams) setCurrent(teams)
    load()
    document.addEventListener('astro:page-load', load)
    return () => {
      listeners.delete(setCurrent)
      document.removeEventListener('astro:page-load', load)
    }
  }, [signedIn])

  return current
}
