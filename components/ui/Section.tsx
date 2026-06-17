import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
}

export function Section({
  className,
  as: Component = 'section',
  ...props
}: SectionProps) {
  return (
    <Component
      className={cn('my-16 md:my-20', className)}
      {...props}
    />
  )
}
