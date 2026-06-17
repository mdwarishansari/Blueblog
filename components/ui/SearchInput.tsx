import * as React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e)
      if (onSearch) onSearch(e.target.value)
    }

    return (
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-4 w-4 text-slate-gray" aria-hidden="true" />
        </div>
        <input
          ref={ref}
          type="text"
          onChange={handleChange}
          className={cn(
            `
            block w-full h-11
            rounded-[16px]
            border border-hairline
            bg-pure-white
            pl-11 pr-4 py-2.5
            text-sm text-ink-charcoal
            placeholder:text-steel-gray
            transition-all duration-200 ease-in-out

            hover:border-slate-300

            focus:outline-none
            focus:border-electric-cobalt
            focus:ring-1
            focus:ring-electric-cobalt

            disabled:cursor-not-allowed
            disabled:opacity-50
            `,
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'
