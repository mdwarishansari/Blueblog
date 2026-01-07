'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'

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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Search by post title
      </label>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Enter post title…"
          className="pl-12"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    </div>
  )
}
