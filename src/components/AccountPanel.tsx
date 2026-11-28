import Login from '@/components/Login'
import AvatarComponent from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { AccountTeam } from '@/lib/competition/account'
import type { MyTeam } from '@/lib/competition/membership'
import { cn } from '@/lib/utils'
import {
  ArrowRightLeft,
  CircleAlert,
  CirclePause,
  GitPullRequest,
  RefreshCw,
  Trophy,
  UserPlus,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface Props {
  signedIn: boolean
  // As stored; null if they couldn't be loaded
  teams: AccountTeam[] | null
  problem: string | null
  returnTo: string
  installationId?: number | null
}

const APP_LINK = 'https://github.com/apps/warwickai'
const LEAVE_LINK = 'https://github.com/settings/repositories'

function statusBadge(team: MyTeam): {
  label: string
  variant: 'secondary' | 'outline' | 'destructive'
} {
  if (!team.teamId) return { label: 'Not on a team', variant: 'outline' }
  if (team.state === 'dsq')
    return { label: 'Disqualified', variant: 'destructive' }
  if (team.state === 'hidden')
    return { label: 'Not shown on the leaderboard', variant: 'outline' }
  if (team.state === 'onHold') return { label: 'On hold', variant: 'outline' }
  return { label: "You're in", variant: 'secondary' }
}

// The site's card, over the page's particles
const card = 'bg-background/75 rounded-xl border p-4'

export default function AccountPanel({
  signedIn,
  teams: storedTeams,
  problem: storedProblem,
  returnTo,
  installationId = null,
}: Props) {
  const [teams, setTeams] = useState(storedTeams)
  const [problem, setProblem] = useState(storedProblem)
  const [syncing, setSyncing] = useState(false)

  const sync = async () => {
    if (syncing) return
    setSyncing(true)
    const response = await fetch('/api/me/sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ installationId }),
    }).catch(() => null)
    const body = (await response?.json().catch(() => null)) as {
      teams: AccountTeam[] | null
      problem: string | null
    } | null
    if (response?.ok && body) {
      if (body.teams) setTeams(body.teams)
      setProblem(body.problem)
    } else {
      setProblem("Couldn't sync with GitHub. Try again.")
    }
    setSyncing(false)
  }

  // Once on arrival, so changes on GitHub since the last push show
  useEffect(() => {
    if (signedIn) void sync()
  }, [])

  if (!signedIn) return <SignIn returnTo={returnTo} />

  return (
    <div className="flex flex-col gap-4">
      <div className="mt-2 flex items-center justify-between gap-2">
        <h2 className="text-2xl font-medium">Your teams</h2>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-busy={syncing}
                onClick={sync}
              >
                <RefreshCw
                  className={cn('size-4', syncing && 'animate-spin')}
                />
                <span className="sr-only">Sync with GitHub</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {syncing ? 'Syncing with GitHub…' : 'Sync with GitHub'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {problem && (
        <p className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          {problem}
        </p>
      )}
      {!teams ? null : teams.length ? (
        teams.map((team) => <TeamCard key={team.projectId} team={team} />)
      ) : syncing ? (
        <p className={cn(card, 'text-muted-foreground text-sm')}>
          Checking GitHub for your teams…
        </p>
      ) : (
        <div className={cn(card, 'flex flex-col gap-2 text-sm')}>
          <p className="text-foreground font-medium">
            You're not in a competition yet
          </p>
          <p className="text-muted-foreground">
            Make a repository from a competition's template, then{' '}
            <a
              href={APP_LINK}
              className="decoration-muted-foreground hover:decoration-foreground underline underline-offset-[3px]"
            >
              install the WarwickAI app
            </a>{' '}
            on it. GitHub brings you back here, and your team appears. If a
            teammate made the repository, ask them to add you as a collaborator
            on GitHub and accept the invitation.
          </p>
        </div>
      )}
    </div>
  )
}

function SignIn({ returnTo }: { returnTo: string }) {
  return (
    <div className={cn(card, 'text-sm')}>
      <Login callbackURL={returnTo} horizontal />
    </div>
  )
}

function TeamCard({ team }: { team: AccountTeam }) {
  const [switching, setSwitching] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const switchTo = async (teamId: string) => {
    setSwitching(teamId)
    setError(null)
    const response = await fetch('/api/teams/switch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ projectId: team.projectId, teamId }),
    }).catch(() => null)
    if (response?.ok) {
      window.location.href = '/account'
      return
    }
    const body = (await response?.json().catch(() => null)) as {
      error?: string
    } | null
    setError(body?.error ?? "Couldn't switch teams, try again")
    setSwitching(null)
  }

  // The same underline as the site's Link component
  const link =
    'underline decoration-muted-foreground underline-offset-[3px] hover:decoration-foreground'
  const status = statusBadge(team)

  return (
    <section className={cn(card, 'flex flex-col gap-4 text-sm')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="mb-1 text-lg font-medium">{team.projectName}</h3>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={status.variant}>{status.label}</Badge>
            {team.locked && <Badge variant="outline">Teams locked</Badge>}
          </div>
        </div>
        <a
          href={`/projects/${team.projectId}/scores`}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'shrink-0 gap-1.5',
          )}
        >
          <Trophy className="size-3.5" />
          Leaderboard
        </a>
      </div>

      {team.teamId && (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex shrink-0 -space-x-2">
            {team.members.slice(0, 5).map((m, i) => (
              <AvatarComponent
                key={i}
                src={m.image || undefined}
                alt={m.name}
                fallback={m.name[0] || 'U'}
                className="border-background size-8 rounded-full border-2"
              />
            ))}
          </div>
          <div className="min-w-0">
            <p className="text-foreground truncate">
              {team.members.map((m) => m.name).join(', ')}
            </p>
            {team.repoFullName && (
              <a
                href={`https://github.com/${team.repoFullName}`}
                className={cn('text-muted-foreground text-xs', link)}
              >
                {team.repoFullName}
              </a>
            )}
          </div>
        </div>
      )}

      {team.state === 'onHold' && (
        <div className="border-destructive/40 bg-destructive/10 flex items-start gap-2 rounded-md border p-3">
          <CirclePause className="text-destructive mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col gap-1">
            <p>
              Your team can't play or rank while someone on another team can
              push to your repository:
            </p>
            <ul className="list-disc pl-4">
              {team.holdReasons.map((r) => (
                <li key={r.name}>
                  {r.name}, who is on {r.otherRepoFullName}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground">
              Remove them in your repository's{' '}
              {team.repoFullName ? (
                <a
                  href={`https://github.com/${team.repoFullName}/settings/access`}
                  className={link}
                >
                  Settings → Collaborators & teams
                </a>
              ) : (
                'Settings → Collaborators & teams'
              )}
              , or they can leave it themselves, or switch to your team.
            </p>
          </div>
        </div>
      )}

      {team.unclaimedGithubUserIds.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border p-3">
          <UserPlus className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          <p className="min-w-0">
            {team.unclaimedLogins.length
              ? `These teammates haven't signed in yet: ${team.unclaimedLogins.map((l) => `@${l}`).join(', ')}.`
              : `${team.unclaimedGithubUserIds.length} teammate${team.unclaimedGithubUserIds.length === 1 ? " hasn't" : "s haven't"} signed in yet.`}{' '}
            They're only part of the team once they sign in here.
          </p>
        </div>
      )}

      {team.suggestedLogins.length > 0 && team.repoFullName && (
        <div className="flex items-start gap-2 rounded-md border p-3">
          <GitPullRequest className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          <p>
            {team.suggestedLogins.map((l) => `@${l}`).join(', ')}{' '}
            {team.suggestedLogins.length === 1 ? 'has' : 'have'} commits in{' '}
            {team.repoFullName} but{' '}
            {team.suggestedLogins.length === 1 ? "isn't" : "aren't"} on your
            team.{' '}
            <span className="text-muted-foreground">
              If they're teammates, the repository's owner can add them in{' '}
              <a
                href={`https://github.com/${team.repoFullName}/settings/access`}
                className={link}
              >
                Settings → Collaborators
              </a>
              , then they sign in here.
            </span>
          </p>
        </div>
      )}

      {team.switchOffers.map((offer) => (
        <div
          key={offer.teamId}
          className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-start gap-2">
            <ArrowRightLeft className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <span>
              You can push to {offer.repoFullName}. Switch to that team?{' '}
              {team.teamId && (
                <span className="text-muted-foreground">
                  Your current team keeps its points. If you're only helping,
                  leave it instead, from{' '}
                  <a href={LEAVE_LINK} className={link}>
                    Settings → Repositories
                  </a>{' '}
                  on GitHub: while you can push to it, that team can't play.
                </span>
              )}
            </span>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-fit shrink-0"
            disabled={switching !== null}
            onClick={() => switchTo(offer.teamId)}
          >
            {switching === offer.teamId ? 'Switching...' : 'Switch'}
          </Button>
        </div>
      ))}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <p className="text-muted-foreground text-xs">
        Entering means you agree to the{' '}
        <a
          href={`https://github.com/${team.templateRepo}#fair-play`}
          className={link}
        >
          competition rules
        </a>
        .
      </p>
    </section>
  )
}
