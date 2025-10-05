import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import AccountAvatar from '@/components/AccountAvatar'
import AuthWall from '@/components/AuthWall'
import UserInfo from '@/components/UserInfo'

export default function AccountPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Account information"
          className={cn('-me-2 size-8')}
        >
          <AccountAvatar />
          <span className="sr-only">Account information</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('bg-accent w-80')}>
        <AuthWall>
          <UserInfo />
        </AuthWall>
      </PopoverContent>
    </Popover>
  )
}
