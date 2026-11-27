import { useSession } from '@/lib/auth-client'
import LogOutButton from '@/components/LogOutButton'
import { buttonVariants } from '@/components/ui/button'
import { attentionLine, stopsPlay } from '@/lib/competition/membership'
import { useMyTeams } from '@/lib/competition/use-my-teams'
import { cn } from '@/lib/utils'
import { Settings } from 'lucide-react'

// The popover is already the ghost hover colour, so hover to the page's
const hover = 'hover:bg-background dark:hover:bg-background'

export default function UserInfo() {
  const { data: session } = useSession()
  const teams = useMyTeams(!!session?.user)

  if (!session?.user) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm min-w-0">
          <p className="text-foreground font-medium">
            Hello, {session.user.name || 'User'}!
          </p>
          {session.user.email && (
            <p className="text-muted-foreground text-xs mt-1 truncate">
              {session.user.email}
            </p>
          )}
        </div>
        <div className="-me-2 -mt-1.5 flex shrink-0">
          <a
            href="/account"
            title="Your account"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8', hover)}
          >
            <Settings className="size-4" />
            <span className="sr-only">Your account</span>
          </a>
          <LogOutButton iconOnly className={hover} />
        </div>
      </div>
      {teams && teams.length > 0 && (
        <div className="flex flex-col gap-1 border-t pt-3">
          <p className="text-muted-foreground text-xs font-medium">Your teams</p>
          <ul className="-mx-2 flex flex-col">
            {teams.map((team) => {
              const line = attentionLine(team)
              return (
                <li key={team.projectId}>
                  <a
                    href="/account"
                    className={cn('block min-w-0 rounded-md px-2 py-1.5 text-sm', hover)}
                  >
                    <p className="text-foreground font-medium">{team.projectName}</p>
                    <p className="text-muted-foreground text-xs truncate">
                      {team.repoFullName ?? 'Not on a team yet'}
                    </p>
                    {line && (
                      <p
                        className={cn(
                          'mt-0.5 flex items-start gap-1.5 text-xs',
                          stopsPlay(team)
                            ? 'text-destructive'
                            : 'text-amber-600 dark:text-amber-400',
                        )}
                      >
                        {/* Centred on the first line */}
                        <span
                          className={cn(
                            'mt-1.25 size-1.5 shrink-0 rounded-full',
                            stopsPlay(team) ? 'bg-destructive' : 'bg-amber-500',
                          )}
                        />
                        {line}
                      </p>
                    )}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
