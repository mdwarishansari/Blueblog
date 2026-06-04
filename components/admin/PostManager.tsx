'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PostTable from '@/components/PostTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search } from 'lucide-react'
import { Post, User, Category, Image as ImageType } from '@prisma/client'

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
      badgeColor: 'bg-orange-500',
    },
  ]

  const isAdminOrEditor = user.role === 'ADMIN' || user.role === 'EDITOR'

  return (
    <div className="space-y-8 w-full max-w-full min-w-0">
      {/* ================= FILTERS ================= */}
      <div className="rounded-2xl bg-card p-5 elev-sm space-y-4 max-w-full overflow-x-hidden">
        {/* Search Bar */}
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
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 rounded-xl bg-muted/60 p-1 shadow-inner">
          {filterTabs.map(tab => (
            <Button
              key={tab.label}
              size="sm"
              variant={tab.active ? 'default' : 'ghost'}
              className={`${tab.active ? 'btn-glow' : ''} relative`}
              onClick={() => handleFilterClick(tab.statusKey)}
            >
              {tab.label}
              {tab.badge && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full text-white ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* ================= TABLE ================= */}
      {/* 🔥 TABLE SCROLLS — PAGE NEVER DOES */}
      <div className="relative rounded-2xl bg-card elev-md overflow-hidden">
        {/* Bottom Shimmer Overlay */}
        {isPending && (
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center bg-white/60 backdrop-blur-[1px] animate-fade-in">
            <div className="w-full h-full skeleton-enhanced" />
          </div>
        )}

        <div className={`w-full overflow-x-auto ui-transition ${isPending ? 'opacity-40' : ''}`}>
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* INFO */}
        <p className="text-sm text-muted-foreground">
          {total === 0
            ? 'No posts found'
            : `Showing ${skip + 1} – ${Math.min(skip + limit, total)} of ${total}`}
        </p>

        {/* CONTROLS */}
        <div className="flex items-center gap-3">
          {/* PREVIOUS */}
          <Button
            size="sm"
            variant="outline"
            disabled={!hasPrev || isPending}
            onClick={() => navigate(selectedStatus, searchValue, page - 1)}
          >
            Previous
          </Button>

          {/* PAGE INFO */}
          <span className="text-sm text-muted-foreground">
            Page {page} of {safeTotalPages}
          </span>

          {/* NEXT */}
          <Button
            size="sm"
            variant="outline"
            disabled={!hasNext || isPending}
            onClick={() => navigate(selectedStatus, searchValue, page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
