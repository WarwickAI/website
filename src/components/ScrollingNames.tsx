import { useRef, useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface ScrollingNamesProps {
  names: string[]
  unlinkedCount: number
  className?: string
}

export default function ScrollingNames({ names, unlinkedCount, className }: ScrollingNamesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLSpanElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const animationRef = useRef<Animation | null>(null)
  const isHoveredRef = useRef(false)
  const cancelledRef = useRef(false)

  const runAnimation = useCallback(async (content: HTMLSpanElement, scrollDistance: number) => {
    while (!cancelledRef.current) {
      // Pause at start for 1.5 seconds, but check for cancellation
      const pauseStart = Date.now()
      while (Date.now() - pauseStart < 1500) {
        if (cancelledRef.current) return
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      if (cancelledRef.current) break

      setIsScrolling(true)

      // Calculate duration: ~25px per second for comfortable reading
      const duration = (scrollDistance / 25) * 1000

      animationRef.current = content.animate(
        [
          { transform: 'translateX(0)' },
          { transform: `translateX(-${scrollDistance}px)` }
        ],
        {
          duration,
          easing: 'linear',
          fill: 'forwards'
        }
      )

      if (isHoveredRef.current) {
        animationRef.current.pause()
      }

      try {
        await animationRef.current.finished
      } catch {
        // Animation was cancelled
        break
      }

      setIsScrolling(false)
      animationRef.current = null

      // Reset position
      content.style.transform = 'translateX(0)'
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    cancelledRef.current = false

    const checkOverflow = () => {
      // Measure just the first span (original content)
      const firstSpan = content.querySelector('span')
      if (!firstSpan) return

      const overflows = firstSpan.offsetWidth > container.clientWidth
      setIsOverflowing(overflows)
      setIsScrolling(false)

      if (overflows) {
        // Scroll distance is the first span width plus the gap
        const scrollDistance = firstSpan.offsetWidth + 48 // 48px = gap (3rem)
        runAnimation(content, scrollDistance)
      }
    }

    // Small delay to ensure layout is complete
    const timeoutId = setTimeout(checkOverflow, 50)

    const resizeObserver = new ResizeObserver(() => {
      cancelledRef.current = true
      animationRef.current?.cancel()
      animationRef.current = null
      setTimeout(() => {
        cancelledRef.current = false
        checkOverflow()
      }, 50)
    })
    resizeObserver.observe(container)

    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
      cancelledRef.current = true
      animationRef.current?.cancel()
    }
  }, [names, unlinkedCount, runAnimation])

  const handleMouseEnter = () => {
    isHoveredRef.current = true
    animationRef.current?.pause()
  }

  const handleMouseLeave = () => {
    isHoveredRef.current = false
    animationRef.current?.play()
  }

  const getMaskStyle = () => {
    if (!isOverflowing) return undefined

    // Show both fades when actively scrolling (even if paused mid-scroll)
    if (isScrolling) {
      return {
        maskImage: 'linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)'
      }
    }

    // Only right fade when at start position (not scrolling)
    return {
      maskImage: 'linear-gradient(to right, black, black calc(100% - 12px), transparent)',
      WebkitMaskImage: 'linear-gradient(to right, black, black calc(100% - 12px), transparent)'
    }
  }

  const content = (
    <>
      {names.map((name, idx) => (
        <span key={idx}>{idx > 0 && ', '}{name}</span>
      ))}
      {unlinkedCount > 0 && (
        <>
          {names.length > 0 && ', '}
          <span className="italic">
            {unlinkedCount} unclaimed
          </span>
        </>
      )}
    </>
  )

  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden w-0 min-w-full', className)}
      style={getMaskStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        ref={contentRef}
        className={cn(
          'inline-flex whitespace-nowrap text-xs sm:text-sm text-muted-foreground',
          isOverflowing && 'gap-12'
        )}
      >
        <span className="shrink-0">{content}</span>
        {isOverflowing && <span className="shrink-0">{content}</span>}
      </span>
    </div>
  )
}
