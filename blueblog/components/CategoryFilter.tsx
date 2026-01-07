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
    <ul className="space-y-2">
      {categories.map(cat => {
        const isActive = active === cat.slug

        return (
          <li key={cat.id}>
            <button
              type="button"
              onClick={() => selectCategory(cat.slug)}
              className={cn(
                `
                group flex w-full items-center justify-between
                rounded-lg px-3 py-2
                text-sm font-medium
                ui-transition
                `,
                isActive
                  ? `
                    bg-gradient-to-r
                    from-indigo-500 via-violet-500 to-pink-500
                    text-white
                    elev-sm
                  `
                  : `
                    bg-card text-fg
                    hover:bg-[var(--muted)]
                  `
              )}
            >
              {/* name */}
              <span className="truncate">
                {cat.name}
              </span>

              {/* count */}
              <span
                className={cn(
                  `
                  ml-3 inline-flex min-w-[1.75rem]
                  items-center justify-center
                  rounded-full px-2 py-0.5
                  text-xs
                  `,
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
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
