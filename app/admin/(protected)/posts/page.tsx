import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PostTable from '@/components/PostTable'
import { Button } from '@/components/ui/Button'
import { Plus, Clock } from 'lucide-react'
import { Prisma } from '@prisma/client'
import PostSearchInput from '@/components/admin/PostSearchInput'

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>
}) {
  const user = await requireAuth()
  const params = await searchParams

  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 10
  const skip = (page - 1) * limit

  // Accept all three status values
  const status =
    params.status === 'PUBLISHED' ||
      params.status === 'DRAFT' ||
      params.status === 'VERIFICATION_PENDING'
      ? params.status
      : undefined

  const where: Prisma.PostWhereInput = {}

  if (status) where.status = status

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { slug: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  if (user.role === 'WRITER') {
    where.authorId = user.id
  }

  const [posts, total, pendingCount] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, email: true } },
        bannerImage: true,
        categories: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
    // Count pending posts (for badge)
    prisma.post.count({
      where: {
        status: 'VERIFICATION_PENDING',
        ...(user.role === 'WRITER' ? { authorId: user.id } : {}),
      },
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  const query = new URLSearchParams({
    ...(params.search && { search: params.search }),
    ...(status && { status }),
  }).toString()

  const safeTotalPages = Math.max(1, totalPages)

  const hasPrev = page > 1
  const hasNext = page < safeTotalPages

  const isAdminOrEditor = user.role === 'ADMIN' || user.role === 'EDITOR'

  // Filter tabs
  const filterTabs = [
    { label: 'All', href: '/admin/posts', active: !status },
    {
      label: 'Published',
      href: '/admin/posts?status=PUBLISHED',
      active: status === 'PUBLISHED',
    },
    {
      label: 'Drafts',
      href: '/admin/posts?status=DRAFT',
      active: status === 'DRAFT',
    },
    {
      label: 'Pending',
      href: '/admin/posts?status=VERIFICATION_PENDING',
      active: status === 'VERIFICATION_PENDING',
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-orange-500',
    },
  ]

  return (
    /* 🔒 ABSOLUTE WIDTH LOCK */
    <section className="w-full max-w-full min-w-0 overflow-x-hidden space-y-8 animate-fade-in">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fg">Posts</h1>
          <p className="text-sm text-muted-foreground">
            Manage and publish blog content
          </p>
        </div>

        <Link href="/admin/posts/new">
          <Button className="gap-2 btn-glow btn-hover-effect">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* ================= PENDING ALERT (Admin/Editor) ================= */}
      {isAdminOrEditor && pendingCount > 0 && !status && (
        <div className="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 p-4 flex items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-sm text-orange-800">
              <span className="font-semibold">{pendingCount}</span> post{pendingCount !== 1 ? 's' : ''} awaiting verification
            </p>
          </div>
          <Link href="/admin/posts?status=VERIFICATION_PENDING">
            <Button size="sm" variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-100">
              Review Now
            </Button>
          </Link>
        </div>
      )}

      {/* ================= FILTERS ================= */}
      <div className="rounded-2xl bg-card p-5 elev-sm space-y-4 max-w-full overflow-x-hidden">
        <PostSearchInput />

        <div className="flex flex-wrap gap-2 rounded-xl bg-muted/60 p-1 shadow-inner">
          {filterTabs.map(tab => (
            <Link key={tab.label} href={tab.href}>
              <Button
                size="sm"
                variant={tab.active ? 'default' : 'ghost'}
                className={`${tab.active ? 'btn-glow' : ''} relative`}
              >
                {tab.label}
                {tab.badge && (
                  <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full text-white ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* ================= TABLE ================= */}
      {/* 🔥 TABLE SCROLLS — PAGE NEVER DOES */}
      <div className="rounded-2xl bg-card elev-md overflow-x-hidden md:overflow-x-auto">
        <div className="w-full md:min-w-[900px]">
          <PostTable
            posts={posts}
            user={user}
            showBulkActions={isAdminOrEditor && status === 'VERIFICATION_PENDING'}
          />
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
          {hasPrev ? (
            <Link
              href={`/admin/posts?page=${page - 1}${query ? `&${query}` : ''}`}
            >
              <Button size="sm" variant="outline">
                Previous
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" disabled>
              Previous
            </Button>
          )}

          {/* PAGE INFO */}
          <span className="text-sm text-muted-foreground">
            Page {page} of {safeTotalPages}
          </span>

          {/* NEXT */}
          {hasNext ? (
            <Link
              href={`/admin/posts?page=${page + 1}${query ? `&${query}` : ''}`}
            >
              <Button size="sm" variant="outline">
                Next
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" disabled>
              Next
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
