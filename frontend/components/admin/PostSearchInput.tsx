'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'

export default function PostSearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initial = searchParams.get('search') ?? ''
  const status = searchParams.get('status')

  const [value, setValue] = useState(initial)

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams()

      if (value) params.set('search', value)
      if (status) params.set('status', status)

      router.push(`/admin/posts?${params.toString()}`)
    }, 400)

    return () => clearTimeout(t)
  }, [value, status, router])

  return (
    <div className="relative flex-1 group">
      <Search
        className="
          absolute left-3 top-1/2 -translate-y-1/2
          h-4 w-4
          text-muted-foreground
          ui-transition
          group-focus-within:text-indigo-500
        "
      />

      <Input
        placeholder="Search posts…"
        className="
          pl-10
          bg-card
          focus-visible:border-indigo-500
        "
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}
