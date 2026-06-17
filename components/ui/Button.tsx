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
    'rounded-full font-medium whitespace-nowrap',
    'select-none',
    'transition-all duration-200 ease-in-out',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'text-pure-white',
          'bg-electric-cobalt',
          'hover:bg-deep-cobalt',
        ].join(' '),

        secondary: [
          'bg-pure-white text-ink-charcoal',
          'border border-hairline',
          'hover:bg-canvas-cream',
          'shadow-sm',
        ].join(' '),

        outline: [
          'bg-transparent text-ink-charcoal',
          'border border-hairline',
          'hover:bg-canvas-cream',
        ].join(' '),

        ghost: [
          'bg-transparent text-ink-charcoal',
          'hover:bg-surface-ivory',
        ].join(' '),

        link: [
          'bg-transparent text-electric-cobalt',
          'hover:underline',
          'p-0 h-auto',
        ].join(' '),
      },

      size: {
        sm: 'h-9 px-4 text-sm',
        default: 'h-11 px-6 text-[15px]',
        lg: 'h-13 px-8 text-base',
        icon: 'h-10 w-10 p-0 rounded-full',
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
