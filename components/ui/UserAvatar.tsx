'use client'

import { useState, useEffect } from 'react'
import { User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface UserAvatarProps {
  src?: string | null | undefined
  name?: string | null | undefined
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  loading?: boolean
}

export function UserAvatar({
  src: propSrc,
  name,
  size = 'md',
  className,
  loading = false,
}: UserAvatarProps) {
  const [src, setSrc] = useState<string | null>(propSrc ?? null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setSrc(propSrc ?? null)
    setError(false)
  }, [propSrc])

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl',
  }

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : null

  if (loading) {
    return (
      <div
        className={cn(
          'skeleton animate-pulse rounded-full border border-hairline',
          sizeClasses[size],
          className
        )}
      />
    )
  }

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        onError={() => setError(true)}
        className={cn(
          'rounded-full object-cover border border-hairline shadow-subtle',
          sizeClasses[size],
          className
        )}
        referrerPolicy="no-referrer"
      />
    )
  }

  // Fallback
  return (
    <div
      className={cn(
        'rounded-full bg-surface-ivory border border-hairline flex items-center justify-center font-semibold text-ink-charcoal shadow-subtle select-none',
        sizeClasses[size],
        className
      )}
    >
      {initials || <UserIcon className="h-1/2 w-1/2 text-slate-gray" />}
    </div>
  )
}
