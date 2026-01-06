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
    router.refresh() // ✅ THIS LINE FIXES IT
  }

  return (
    <ul className="space-y-2">
      {categories.map((cat) => (
        <li key={cat.id}>
          <button
            type="button"
            onClick={() => selectCategory(cat.slug)}
            className={cn(
              'flex w-full items-center justify-between rounded px-2 py-1 text-left',
              active === cat.slug
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-gray-100'
            )}
          >
            <span>{cat.name}</span>
            <span className="text-sm text-gray-500">
              {cat._count.posts}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
