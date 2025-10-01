import { useSession, signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function UserInfo() {
  const { data: session } = useSession()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (!session?.user) return null

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm">
        <p className="text-foreground font-medium">
          Hello, {session.user.name || 'User'}!
        </p>
        {session.user.email && (
          <p className="text-muted-foreground text-xs mt-1">
            {session.user.email}
          </p>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full"
      >
        {isLoggingOut ? 'Logging out...' : 'Log out'}
      </Button>
    </div>
  )
}
