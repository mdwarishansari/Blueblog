'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
  className={cn(
    'relative w-[95vw] max-w-full transform overflow-hidden rounded-2xl bg-white'
,
    sizeClasses[size]
  )}
  onClick={(e) => e.stopPropagation()}
>

        {/* HEADER */}
        {(title || showCloseButton) && (
          <div className="flex items-start gap-4 px-6 py-5">
            {title && (
              <div className="flex-1">
                <h3 className="text-lg font-semibold tracking-tight text-fg">
                  {title}
                </h3>
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            )}

            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}

        {/* SUBTLE DIVIDER */}
        {(title || showCloseButton) && (
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        )}

        {/* CONTENT */}
        <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
