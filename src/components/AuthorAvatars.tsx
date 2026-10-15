import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AuthorAvatarsProps {
  authors: { id: string; name: string; avatar: string; isRegistered: boolean }[]
}

export default function AuthorAvatars({ authors }: AuthorAvatarsProps) {
  return (
    <TooltipProvider delayDuration={200} disableHoverableContent>
      <div className="flex -space-x-1.5 hover:space-x-0.5">
        {authors.map((author) => (
          <Tooltip key={author.id}>
            <TooltipTrigger asChild>
              <a
                href={author.isRegistered ? `/authors/${author.id}` : undefined}
                className="rounded-full transition-[margin] duration-200 ease-out"
              >
                <Avatar className="ring-background size-5 ring-2">
                  <AvatarImage src={author.avatar} alt={author.name} />
                  <AvatarFallback>{author.name[0]}</AvatarFallback>
                </Avatar>
              </a>
            </TooltipTrigger>
            <TooltipContent>{author.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
