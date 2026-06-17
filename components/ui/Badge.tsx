import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'violet' | 'green' | 'blue'
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-lavender-mist text-vivid-violet',
    secondary: 'bg-canvas-cream text-slate-gray border border-hairline',
    violet: 'bg-lavender-mist text-vivid-violet',
    green: 'bg-green-50 text-forest border border-green-100',
    blue: 'bg-powder-blue/40 text-electric-cobalt',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[8px] px-2.5 py-0.5 text-xs font-medium tracking-wide',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}
