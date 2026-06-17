'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PostTable from '@/components/PostTable'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Card } from '@/components/ui/Card'
import { Post, User, Category, Image as ImageType } from '@prisma/client'
import { cn } from '@/lib/utils'

interface PostManagerProps {
  initialPosts: (Post & {
    author: Pick<User, 'id' | 'name' | 'email'>
    bannerImage: ImageType | null
    categories: Category[]
  })[]
  user: Pick<User, 'id' | 'role'>
  pendingCount: number
  total: number
  page: number
  limit: number
  totalPages: number
  initialStatus?: string | undefined
  initialSearch?: string | undefined
}

export default function PostManager({
  initialPosts,
  user,
  pendingCount,
  total,
  page,
  limit,
  totalPages,
  initialStatus = '',
  initialSearch = '',
}: PostManagerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Local state for instant UI changes
  const [selectedStatus, setSelectedStatus] = useState(initialStatus)
  const [searchValue, setSearchValue] = useState(initialSearch)

  // Sync state if searchParams change externally (e.g. browser history back/forward)
  useEffect(() => {
    setSelectedStatus(searchParams.get('status') || '')
    setSearchValue(searchParams.get('search') || '')
  }, [searchParams])

  const navigate = (status: string, search: string, pageNum: number) => {
    startTransition(() => {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (search) params.set('search', search)
      if (pageNum > 1) params.set('page', pageNum.toString())
      router.push(`/admin/posts?${params.toString()}`)
    })
  }

  const handleFilterClick = (status: string) => {
    setSelectedStatus(status)
    navigate(status, searchValue, 1)
  }

  // Debounced search trigger
  useEffect(() => {
    const t = setTimeout(() => {
      // Only navigate if the value has changed from initialSearch
      if (searchValue !== (searchParams.get('search') || '')) {
        navigate(selectedStatus, searchValue, 1)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [searchValue])

  const safeTotalPages = Math.max(1, totalPages)
  const hasPrev = page > 1
  const hasNext = page < safeTotalPages
  const skip = (page - 1) * limit

  // Filter tabs
  const filterTabs = [
    { label: 'All', statusKey: '', active: !selectedStatus },
    {
      label: 'Published',
      statusKey: 'PUBLISHED',
      active: selectedStatus === 'PUBLISHED',
    },
    {
      label: 'Drafts',
      statusKey: 'DRAFT',
      active: selectedStatus === 'DRAFT',
    },
    {
      label: 'Pending',
      statusKey: 'VERIFICATION_PENDING',
      active: selectedStatus === 'VERIFICATION_PENDING',
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-vivid-violet text-pure-white border border-purple-100',
    },
  ]

  const isAdminOrEditor = user.role === 'ADMIN' || user.role === 'EDITOR'

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* ================= FILTERS ================= */}
      <Card variant="white" className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="w-full md:max-w-xs">
          <SearchInput
            placeholder="Search posts…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-canvas-cream border border-hairline p-1 rounded-full">
          {filterTabs.map(tab => (
            <button
              key={tab.label}
              onClick={() => handleFilterClick(tab.statusKey)}
              className={cn(
                'px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5',
                tab.active
                  ? 'bg-pure-white text-ink-charcoal border border-hairline shadow-sm'
                  : 'text-slate-gray hover:text-ink-charcoal hover:bg-pure-white/50'
              )}
            >
              {tab.label}
              {tab.badge && (
                <span className={cn('px-1.5 py-0.5 text-[10px] rounded-full', tab.badgeColor)}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* ================= TABLE ================= */}
      <div className="relative rounded-[16px] bg-pure-white border border-hairline shadow-subtle overflow-hidden">
        {/* Bottom Shimmer Overlay */}
        {isPending && (
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center bg-pure-white/60 backdrop-blur-[1px] animate-fade-in">
            <div className="w-full h-full skeleton" />
          </div>
        )}

        <div className={cn('w-full overflow-x-auto transition-opacity duration-200', isPending ? 'opacity-40' : '')}>
          <div className="w-full md:min-w-[900px]">
            <PostTable
              posts={initialPosts}
              user={user}
              showBulkActions={isAdminOrEditor && selectedStatus === 'VERIFICATION_PENDING'}
            />
          </div>
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        {/* INFO */}
        <p className="text-xs font-semibold text-slate-gray">
          {total === 0
            ? 'No posts found'
            : `Showing ${skip + 1} – ${Math.min(skip + limit, total)} of ${total}`}
        </p>

        {/* CONTROLS */}
        <div className="flex items-center gap-3">
          {/* PREVIOUS */}
          <Button
            size="sm"
            variant="secondary"
            disabled={!hasPrev || isPending}
            onClick={() => navigate(selectedStatus, searchValue, page - 1)}
            className="rounded-full border-hairline text-xs font-semibold h-9"
          >
            Previous
          </Button>

          {/* PAGE INFO */}
          <span className="text-xs font-semibold text-slate-gray">
            Page {page} of {safeTotalPages}
          </span>

          {/* NEXT */}
          <Button
            size="sm"
            variant="secondary"
            disabled={!hasNext || isPending}
            onClick={() => navigate(selectedStatus, searchValue, page + 1)}
            className="rounded-full border-hairline text-xs font-semibold h-9"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
