import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

// Without redirectTo, /account still reloads, as it shows your details
export default function LogOutButton({
  className,
  redirectTo,
  iconOnly = false,
}: {
  className?: string
  redirectTo?: string
  iconOnly?: boolean
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      if (redirectTo) window.location.href = redirectTo
      else if (window.location.pathname === '/account') window.location.reload()
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoggingOut(false)
    }
  }

  if (iconOnly) {
    return (
      <Button
        variant="ghost"
        size="icon"
        title="Log out"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={cn('size-8', className)}
      >
        <LogOut className={cn('size-4', isLoggingOut && 'animate-pulse')} />
        <span className="sr-only">
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
    >
      {isLoggingOut ? 'Logging out...' : 'Log out'}
    </Button>
  )
}
