import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  trend?: string
  color?: 'primary' | 'green' | 'blue' | 'purple' | 'yellow' | 'red'
}

const colorClasses = {
  primary: {
    text: 'text-electric-cobalt',
    icon: 'bg-lavender-mist text-vivid-violet',
  },
  green: {
    text: 'text-forest',
    icon: 'bg-green-50 text-forest border border-green-100',
  },
  blue: {
    text: 'text-electric-cobalt',
    icon: 'bg-powder-blue/40 text-electric-cobalt',
  },
  purple: {
    text: 'text-vivid-violet',
    icon: 'bg-lavender-mist text-vivid-violet',
  },
  yellow: {
    text: 'text-ink-charcoal',
    icon: 'bg-canvas-cream text-slate-gray border border-hairline',
  },
  red: {
    text: 'text-vivid-violet',
    icon: 'bg-lavender-mist text-vivid-violet',
  },
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
}: StatCardProps) {
  if (!Icon) return null

  return (
    <div
      className="
        relative overflow-hidden
        rounded-[16px] bg-pure-white border border-hairline
        p-6 shadow-subtle hover:shadow-md transition-shadow duration-200
      "
    >
      <div className="relative flex items-start justify-between gap-4">
        {/* LEFT */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-gray">
            {title}
          </p>

          <p className={cn("mt-3 text-3xl font-bold tracking-tight", colorClasses[color].text)}>
            {value}
          </p>

          {trend && (
            <p className="mt-1.5 text-xs font-semibold text-forest">
              {trend}
            </p>
          )}
        </div>

        {/* ICON */}
        <div
          className={cn(
            'h-10 w-10 rounded-full flex items-center justify-center',
            colorClasses[color].icon
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </div>
  )
}
