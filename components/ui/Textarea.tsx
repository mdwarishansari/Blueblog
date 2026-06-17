import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          `
          flex min-h-[80px] w-full
          rounded-[16px]
          border border-hairline
          bg-pure-white
          px-4 py-2.5
          text-sm text-ink-charcoal
          placeholder:text-steel-gray
          transition-all duration-200 ease-in-out

          hover:border-slate-300

          focus-visible:outline-none
          focus-visible:border-electric-cobalt
          focus-visible:ring-1
          focus-visible:ring-electric-cobalt

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

Textarea.displayName = 'Textarea'

export { Textarea }
