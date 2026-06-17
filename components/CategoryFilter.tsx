'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function CategoryFilter({ categories }: { categories: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('category')

  function selectCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('category', slug)

    router.push(`/blog?${params.toString()}`)
    router.refresh() // intentional
  }

  return (
    <ul className="space-y-1.5">
      {categories.map((cat) => {
        const isActive = active === cat.slug

        return (
          <li key={cat.id}>
            <button
              type="button"
              onClick={() => selectCategory(cat.slug)}
              className={cn(
                'group flex w-full items-center justify-between rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-surface-ivory border border-hairline text-ink-charcoal shadow-sm'
                  : 'text-slate-gray hover:text-ink-charcoal hover:bg-canvas-cream'
              )}
            >
              {/* name */}
              <span className="truncate">
                {cat.name}
              </span>

              {/* count */}
              <span
                className={cn(
                  'ml-3 inline-flex min-w-[1.75rem] items-center justify-center rounded-full px-2 py-0.5 text-xs transition-colors duration-150',
                  isActive
                    ? 'bg-pure-white text-ink-charcoal border border-hairline'
                    : 'bg-canvas-cream text-slate-gray group-hover:bg-pure-white group-hover:text-ink-charcoal group-hover:border group-hover:border-hairline'
                )}
              >
                {cat._count.posts}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
