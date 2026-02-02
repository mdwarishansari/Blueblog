import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          `
          flex h-10 w-full
          rounded-lg
          border border-[var(--border)]
          bg-card
          px-3 py-2
          text-sm text-fg
          placeholder:text-slate-400

          ui-transition

          hover:border-slate-300

          focus-visible:outline-none
          focus-visible:border-indigo-500
          focus-visible:ring-2
          focus-visible:ring-indigo-500/25

          disabled:cursor-not-allowed
          disabled:opacity-50
          `,
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
