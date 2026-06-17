import { Button } from './Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className={cn('flex items-center justify-between gap-4 py-4 w-full', className)}>
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="hidden md:flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isActive = page === currentPage
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'w-9 h-9 rounded-full text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-electric-cobalt text-pure-white shadow-sm'
                  : 'text-slate-gray hover:text-ink-charcoal hover:bg-canvas-cream'
              )}
            >
              {page}
            </button>
          )
        })}
      </div>

      <div className="md:hidden text-sm text-slate-gray font-medium">
        Page {currentPage} of {totalPages}
      </div>

      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
