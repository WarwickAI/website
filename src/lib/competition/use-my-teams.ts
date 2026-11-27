import { useEffect, useState } from 'react'
import type { MyTeam } from './membership'

export type MyTeamWithAttention = MyTeam & { needsAttention: boolean }

// Fetched once per page load, for the profile photo and the popover
let request: Promise<MyTeamWithAttention[]> | null = null

export function useMyTeams(signedIn: boolean): MyTeamWithAttention[] | null {
  const [teams, setTeams] = useState<MyTeamWithAttention[] | null>(null)

  useEffect(() => {
    if (!signedIn) return
    request ??= fetch('/api/me/teams')
      .then((response) => (response.ok ? response.json() : { teams: [] }))
      .then((body: { teams: MyTeamWithAttention[] }) => body.teams)
      .catch(() => [])
    let cancelled = false
    request.then((result) => !cancelled && setTeams(result))
    return () => {
      cancelled = true
    }
  }, [signedIn])

  return teams
}
