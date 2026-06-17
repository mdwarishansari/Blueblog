import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Plus, Clock } from 'lucide-react'
import { Prisma } from '@prisma/client'
import PostManager from '@/components/admin/PostManager'

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



  const isAdminOrEditor = user.role === 'ADMIN' || user.role === 'EDITOR'

  return (
    /* 🔒 ABSOLUTE WIDTH LOCK */
    <section className="w-full max-w-full min-w-0 overflow-x-hidden space-y-6 animate-fade-in max-w-[1200px] mx-auto pb-10">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-5 bg-pure-white p-6 rounded-[16px] shadow-subtle">
        <div>
          <h1 className="text-2xl font-bold text-ink-charcoal">Posts</h1>
          <p className="text-xs text-slate-gray mt-1">
            Manage and publish blog content
          </p>
        </div>

        <Link href="/admin/posts/new">
          <Button variant="default" size="sm" className="gap-1.5 rounded-full">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* ================= PENDING ALERT (Admin/Editor) ================= */}
      {isAdminOrEditor && pendingCount > 0 && !status && (
        <Card variant="white" className="p-4 border-l-4 border-l-vivid-violet flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lavender-mist text-vivid-violet">
              <Clock className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-ink-charcoal">
              {pendingCount} post{pendingCount !== 1 ? 's' : ''} awaiting verification
            </p>
          </div>
          <Link href="/admin/posts?status=VERIFICATION_PENDING">
            <Button size="sm" variant="secondary" className="h-8 text-xs rounded-full border-hairline">
              Review Now
            </Button>
          </Link>
        </Card>
      )}

      {/* ================= MAIN CONTAINER ================= */}
      <PostManager
        initialPosts={posts}
        user={user}
        pendingCount={pendingCount}
        total={total}
        page={page}
        limit={limit}
        totalPages={totalPages}
        initialStatus={status}
        initialSearch={params.search}
      />
    </section>
  )
}
