import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/Button'
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
