import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PostTable from '@/components/PostTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Search} from 'lucide-react'

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>
}) {
  const user = await requireAuth()
  const params = await searchParams

  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 20
  const skip = (page - 1) * limit

  const status =
    params.status === 'PUBLISHED' || params.status === 'DRAFT'
      ? params.status
      : undefined

  const where: any = {}

  if (status) where.status = status

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { slug: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  // WRITER: only own posts
  if (user.role === 'WRITER') {
    where.authorId = user.id
  }

  const [posts, total] = await Promise.all([
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
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-muted-foreground">Manage blog posts</p>
        </div>

        <Link href="/admin/posts/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts…"
              className="pl-10"
              defaultValue={params.search}
            />
          </div>
          
        </div>

        {/* Status tabs */}
        <div className="flex gap-2">
          {[
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
          ].map(tab => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                tab.active
                  ? 'bg-primary-100 text-primary-700'
                  : 'hover:bg-muted'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <PostTable posts={posts} user={user} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {skip + 1} – {Math.min(skip + limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/admin/posts?page=${page - 1}`}
              aria-disabled={page === 1}
              className={`px-4 py-2 border rounded ${
                page === 1 && 'pointer-events-none opacity-50'
              }`}
            >
              Previous
            </Link>
            <Link
              href={`/admin/posts?page=${page + 1}`}
              aria-disabled={page === totalPages}
              className={`px-4 py-2 border rounded ${
                page === totalPages && 'pointer-events-none opacity-50'
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
