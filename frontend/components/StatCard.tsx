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
    icon: 'bg-indigo-50 text-indigo-600',
    glow: 'from-indigo-500/20 to-purple-500/20',
  },
  green: {
    icon: 'bg-green-50 text-green-600',
    glow: 'from-green-500/20 to-emerald-500/20',
  },
  blue: {
    icon: 'bg-blue-50 text-blue-600',
    glow: 'from-blue-500/20 to-cyan-500/20',
  },
  purple: {
    icon: 'bg-purple-50 text-purple-600',
    glow: 'from-purple-500/20 to-pink-500/20',
  },
  yellow: {
    icon: 'bg-yellow-50 text-yellow-600',
    glow: 'from-yellow-400/20 to-orange-400/20',
  },
  red: {
    icon: 'bg-red-50 text-red-600',
    glow: 'from-red-500/20 to-rose-500/20',
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
        rounded-2xl bg-card
        p-6
        elev-sm
        ui-transition ui-lift
        hover:elev-md
      "
    >
      {/* subtle gradient glow */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300',
          'group-hover:opacity-100',
          'bg-gradient-to-br',
          colorClasses[color].glow
        )}
      />

      <div className="relative flex items-start justify-between gap-4">
        {/* LEFT */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-fg tracking-tight">
            {value}
          </p>

          {trend && (
            <p className="mt-1 text-sm font-medium text-green-600">
              {trend}
            </p>
          )}
        </div>

        {/* ICON */}
        <div
          className={cn(
            'rounded-xl p-3',
            'ui-transition',
            colorClasses[color].icon
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
