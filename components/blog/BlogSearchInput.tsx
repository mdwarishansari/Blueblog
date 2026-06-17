'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchInput } from '@/components/ui/SearchInput'

export default function BlogSearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initial = searchParams.get('q') ?? ''
  const category = searchParams.get('category')

  const [value, setValue] = useState(initial)

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams()

      if (value) params.set('q', value)
      if (category) params.set('category', category)

      router.push(`/blog?${params.toString()}`)
    }, 400) // debounce

    return () => clearTimeout(t)
  }, [value, category, router])

  return (
    <div className="space-y-2 max-w-md mx-auto text-left">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-gray mb-1">
        Search by post title
      </label>
      <SearchInput
        placeholder="Enter post title…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}
