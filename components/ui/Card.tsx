import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'ivory'
  hoverLift?: boolean
}

export function Card({
  className,
  variant = 'white',
  hoverLift = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[16px] border border-hairline shadow-subtle p-6',
        variant === 'white' ? 'bg-pure-white' : 'bg-surface-ivory',
        hoverLift && 'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md',
        className
      )}
      {...props}
    />
  )
}
