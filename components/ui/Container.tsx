import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
}

export function Container({
  className,
  as: Component = 'div',
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn('max-w-[1200px] mx-auto px-4 md:px-6 w-full', className)}
      {...props}
    />
  )
}
