'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/* =====================================================
   BUTTON VARIANTS — SINGLE SOURCE OF TRUTH
   Visual-only. No logic changes.
   ===================================================== */

const buttonVariants = cva(
  [
    // base
    'inline-flex items-center justify-center gap-2',
    'rounded-lg font-medium whitespace-nowrap',
    'select-none',
    'ui-transition btn-hover-effect',
    'disabled:pointer-events-none disabled:opacity-60',
    'active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'text-white',
          'bg-gradient-to-r from-[var(--accent-start)] via-[var(--accent-mid)] to-[var(--accent-end)]',
          'btn-glow', // glow visible by default
        ].join(' '),

        secondary: [
          'bg-card text-fg',
          'border border-[var(--border)]',
          'elev-sm',
          'hover:elev-md',
        ].join(' '),

        outline: [
          'bg-transparent text-fg',
          'border border-[var(--border)]',
          'hover:bg-[var(--muted)]',
          'elev-sm hover:elev-md',
        ].join(' '),

        ghost: [
          'bg-transparent text-fg',
          'hover:bg-[var(--muted)]',
        ].join(' '),

        link: [
          'bg-transparent text-[var(--accent-start)]',
          'underline-offset-4 hover:underline',
          'p-0 h-auto',
        ].join(' '),
      },

      size: {
        sm: 'h-8 px-3 text-sm',
        default: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },

    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

/* =====================================================
   BUTTON COMPONENT
   ===================================================== */

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
