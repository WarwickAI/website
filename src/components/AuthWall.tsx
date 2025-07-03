import { useSession } from '@/lib/auth-client'
import Login from '@/components/Login'

interface AuthWallProps extends React.ComponentProps<'div'> {
  login?: React.ReactNode
  loading?: React.ReactNode
}

export default function AuthWall({
  children,
  login = <Login />,
  loading,
  ...props
}: AuthWallProps) {
  const { data: session, isPending } = useSession()

  if (isPending) return <>{loading}</>
  if (session?.user) return <>{children}</>

  return <>{login}</>
}
