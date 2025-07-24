import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface IconPopoverProps extends React.ComponentProps<'div'> {
  icon?: React.ReactNode
}

export default function IconPopover(props: IconPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={props.title}
          className={cn('-me-2 size-8')}
        >
          {props.icon}
          <span className="sr-only">{props.title}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('bg-accent w-80')}>
        {props.children}
      </PopoverContent>
    </Popover>
  )
}
