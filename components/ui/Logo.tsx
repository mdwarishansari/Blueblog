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
  const [faviconFailed, setFaviconFailed] = useState(false)

  // Sync with prop if it changes
  useEffect(() => {
    if (propSrc !== undefined) {
      setSrc(propSrc)
      setLoading(false)
      setError(false)
      setFaviconFailed(false)
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
          variant === 'header' && 'h-[56px] w-[56px]',
          variant === 'auth' && 'h-[96px] w-[96px]',
          variant === 'sidebar' && 'h-[72px] w-[72px]',
          variant === 'admin-header' && 'h-[64px] w-[64px]',
          variant === 'footer' && 'h-[56px] w-[56px]',
          className
        )}
      />
    )
  }

  // Determine source: Database logo URL, fallback to /favicon.ico, fallback to letter
  const hasDbLogo = src && !error
  const finalSrc = hasDbLogo ? src : '/favicon.ico'

  const handleError = () => {
    if (hasDbLogo) {
      setError(true)
    } else {
      setFaviconFailed(true)
    }
  }

  // If both logo and favicon fail, render letter fallback
  if (faviconFailed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center font-bold text-ink-charcoal bg-surface-ivory border border-hairline select-none rounded-[12px]',
          variant === 'header' && 'h-[56px] w-[56px] text-xl',
          variant === 'auth' && 'h-[96px] w-[96px] text-3xl',
          variant === 'sidebar' && 'h-[72px] w-[72px] text-2xl',
          variant === 'admin-header' && 'h-[64px] w-[64px] text-xl',
          variant === 'footer' && 'h-[56px] w-[56px] text-xl bg-mid-graphite border-mid-graphite text-pure-white',
          className
        )}
      >
        {alt.slice(0, 1).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      onError={handleError}
      className={cn(
        'object-contain rounded-[12px]',
        variant === 'header' && 'h-[56px] w-auto max-w-[180px]',
        variant === 'auth' && 'h-[96px] w-auto max-w-[220px]',
        variant === 'sidebar' && 'h-[72px] w-auto max-w-[180px]',
        variant === 'admin-header' && 'h-[64px] w-auto max-w-[160px]',
        variant === 'footer' && 'h-[56px] w-auto max-w-[150px]',
        className
      )}
    />
  )
}
