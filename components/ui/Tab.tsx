import { cn } from '@/lib/utils'

interface TabItem {
  id: string
  label: string
}

export interface TabProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function Tab({ tabs, activeTab, onChange, className }: TabProps) {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto py-1 no-scrollbar', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap',
              isActive
                ? 'bg-surface-ivory text-ink-charcoal shadow-sm border border-hairline'
                : 'text-slate-gray hover:text-ink-charcoal hover:bg-canvas-cream/50'
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
