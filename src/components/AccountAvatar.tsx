import { useSession } from '@/lib/auth-client'
import { stopsPlay } from '@/lib/competition/membership'
import { useMyTeams } from '@/lib/competition/use-my-teams'
import AvatarComponent from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

export default function AccountAvatar() {
  const { data: session, isPending } = useSession()
  const teams = useMyTeams(!!session?.user)

  if (isPending) {
    return <User className="absolute size-4 animate-pulse" />
  }

  if (session?.user) {
    // Red when a team can't play, amber for anything else to do
    const attention = teams?.some((team) => team.needsAttention)
    const blocked = teams?.some(stopsPlay)
    // Positions the dot against the photo
    return (
      <span className="absolute size-5">
        <AvatarComponent
          src={session.user.image || undefined}
          className="size-5 rounded-full"
          fallback="User"
        />
        {attention && (
          <span
            role="img"
            className={cn(
              'ring-background absolute -top-0.5 -right-0.5 size-2 rounded-full ring-2',
              blocked ? 'bg-destructive' : 'bg-amber-500',
            )}
            aria-label={
              blocked
                ? "One of your teams can't play"
                : 'One of your teams needs attention'
            }
          />
        )}
      </span>
    )
  }

  return <User className="absolute size-4" />
}
