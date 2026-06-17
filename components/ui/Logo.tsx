'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface LogoProps {
  src?: string | null | undefined
  alt?: string
  variant: 'header' | 'auth' | 'sidebar' | 'admin-header' | 'footer'
  className?: string
}

export function Logo({ src: propSrc, alt = 'Logo', variant, className }: LogoProps) {
  const [src, setSrc] = useState<string | null>(propSrc ?? null)
  const [loading, setLoading] = useState(propSrc === undefined)
  const [error, setError] = useState(false)

  // Sync with prop if it changes
  useEffect(() => {
    if (propSrc !== undefined) {
      setSrc(propSrc)
      setLoading(false)
      setError(false)
    }
  }, [propSrc])

  // Fetch logo if not provided
  useEffect(() => {
    if (propSrc === undefined) {
      fetch('/api/public/settings')
        .then(r => r.json())
        .then(d => {
          if (d?.siteLogo) setSrc(d.siteLogo)
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false))
    }
  }, [propSrc])

  if (loading) {
    return (
      <div
        className={cn(
          'skeleton animate-pulse bg-surface-ivory rounded-lg',
          variant === 'header' && 'h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16',
          variant === 'auth' && 'h-20 w-20 sm:h-24 sm:w-24 md:h-[100px] md:w-[100px]',
          variant === 'sidebar' && 'h-14 w-14 sm:h-16 sm:w-16 md:h-[72px] md:w-[72px]',
          variant === 'admin-header' && 'h-12 w-12 sm:h-13 sm:w-13 md:h-14 md:w-14',
          variant === 'footer' && 'h-12 w-12',
          className
        )}
      />
    )
  }

  // Fallback if logo is missing or load failed
  const showFallback = !src || error

  if (showFallback) {
    return (
      <div
        className={cn(
          'flex items-center justify-center font-bold text-ink-charcoal bg-surface-ivory border border-hairline select-none rounded-[12px]',
          variant === 'header' && 'h-12 w-12 text-lg sm:h-14 sm:w-14 md:h-16 md:w-16',
          variant === 'auth' && 'h-20 w-20 text-2xl sm:h-24 sm:w-24 md:h-[100px] md:w-[100px]',
          variant === 'sidebar' && 'h-14 w-14 text-xl sm:h-16 sm:w-16 md:h-[72px] md:w-[72px]',
          variant === 'admin-header' && 'h-12 w-12 text-lg sm:h-13 sm:w-13 md:h-14 md:w-14',
          variant === 'footer' && 'h-12 w-12 text-lg bg-mid-graphite border-mid-graphite text-pure-white',
          className
        )}
      >
        {alt.slice(0, 1).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={cn(
        'object-contain',
        variant === 'header' && 'h-12 sm:h-14 md:h-16 w-auto max-w-[180px]',
        variant === 'auth' && 'h-[72px] sm:h-20 md:h-[100px] w-auto max-w-[220px]',
        variant === 'sidebar' && 'h-14 sm:h-16 md:h-[72px] w-auto max-w-[180px]',
        variant === 'admin-header' && 'h-12 sm:h-13 md:h-14 w-auto max-w-[160px]',
        variant === 'footer' && 'h-12 w-auto max-w-[150px]',
        className
      )}
    />
  )
}
