import * as React from 'react'
import { Card } from './Card'
import { Button } from './Button'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  actionLabel?: string | undefined
  onAction?: (() => void) | undefined
  className?: string | undefined
}

export function EmptyState({
  title,
  description,
  icon = <Inbox className="h-10 w-10 text-slate-gray" />,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('flex flex-col items-center justify-center text-center py-12 px-6 bg-surface-ivory', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pure-white border border-hairline shadow-subtle mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-ink-charcoal mb-1">{title}</h3>
      <p className="text-sm text-slate-gray max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="default" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  )
}
