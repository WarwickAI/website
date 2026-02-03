import { useSession } from '@/lib/auth-client'
import { Trophy } from 'lucide-react'

interface Submission {
  userIds: (string | null)[]
  score: number | null
}

interface Props {
  submissions: Submission[]
}

export default function UserRank({ submissions }: Props) {
  const { data: session, isPending } = useSession()

  if (isPending || !session?.user?.id) return null

  const userIndex = submissions.findIndex((sub) =>
    sub.userIds.includes(session.user.id)
  )
  if (userIndex === -1) return null

  const rank = userIndex + 1
  const score = submissions[userIndex].score

  return (
    <div className="flex items-center gap-2 hidden sm:flex">
      <Trophy className="size-4" />
      <span>Your rank: #{rank} ({score?.toFixed(2) ?? 'Pending'} pts)</span>
    </div>
  )
}
