'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface DropdownOption {
  value: string
  label: string
}

export interface DropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
  align?: 'left' | 'right'
}

export function Dropdown({
  options,
  value,
  onChange,
  label,
  className,
  align = 'left',
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      {label && <span className="block text-xs font-medium text-slate-gray mb-1">{label}</span>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex w-full items-center justify-between gap-x-1.5 rounded-[16px] bg-pure-white px-4 py-2.5 text-sm font-medium text-ink-charcoal shadow-sm ring-1 ring-hairline hover:bg-canvas-cream transition-all duration-200"
      >
        {selectedOption ? selectedOption.label : 'Select option'}
        <ChevronDown className="h-4 w-4 text-slate-gray shrink-0" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-10 mt-2 w-56 origin-top-right rounded-[16px] bg-pure-white shadow-lg ring-1 ring-hairline focus:outline-none overflow-hidden py-1',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={cn(
                'block w-full text-left px-4 py-2 text-sm transition-colors duration-150',
                option.value === value
                  ? 'bg-surface-ivory text-electric-cobalt font-medium'
                  : 'text-ink-charcoal hover:bg-canvas-cream'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
