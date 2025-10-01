import { useSession } from '@/lib/auth-client'
import AvatarComponent from '@/components/ui/avatar'
import { User } from 'lucide-react'

export default function AccountAvatar() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return <User className="absolute size-4 animate-pulse" />
  }

  if (session?.user) {
    return (
      <AvatarComponent
        src={session.user.image || undefined}
        className="absolute size-5 rounded-full"
        fallback="User"
      />
    )
  }

  return <User className="absolute size-4" />
}
