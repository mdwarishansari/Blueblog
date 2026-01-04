import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'
import PostTable from '@/components/PostTable'

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; search?: string }
}) {
  const user = await requireAuth()
  
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const where: any = {}
  
  if (searchParams.status) {
    where.status = searchParams.status
  }
  
  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: 'insensitive' } },
      { excerpt: { contains: searchParams.search, mode: 'insensitive' } },
      { slug: { contains: searchParams.search, mode: 'insensitive' } },
    ]
  }

  // Writers can only see their own posts
  if (user.role === 'WRITER') {
    where.authorId = user.id
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-600">Manage your blog posts</p>
        </div>
        <Link href="/admin/posts/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Total Posts</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{total}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Published</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {posts.filter(p => p.status === 'PUBLISHED').length}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Drafts</div>
          <div className="mt-1 text-2xl font-bold text-yellow-600">
            {posts.filter(p => p.status === 'DRAFT').length}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">This Month</div>
          <div className="mt-1 text-2xl font-bold text-primary-600">
            {posts.filter(p => {
              const postDate = new Date(p.createdAt)
              const now = new Date()
              return postDate.getMonth() === now.getMonth() && 
                     postDate.getFullYear() === now.getFullYear()
            }).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search posts..."
                className="pl-10"
                defaultValue={searchParams.search}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">Reset</Button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="mt-4 flex gap-2">
          <Link
            href="/admin/posts"
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              !searchParams.status
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </Link>
          <Link
            href="/admin/posts?status=PUBLISHED"
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              searchParams.status === 'PUBLISHED'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Published
          </Link>
          <Link
            href="/admin/posts?status=DRAFT"
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              searchParams.status === 'DRAFT'
                ? 'bg-yellow-100 text-yellow-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Drafts
          </Link>
        </div>
      </div>

      {/* Posts Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <PostTable posts={posts} user={user} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t bg-white px-6 py-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{skip + 1}</span> to{' '}
            <span className="font-medium">{Math.min(skip + limit, total)}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/posts?page=${Math.max(1, page - 1)}`}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                page === 1
                  ? 'cursor-not-allowed border-gray-200 text-gray-400'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </Link>
            <Link
              href={`/admin/posts?page=${Math.min(totalPages, page + 1)}`}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                page === totalPages
                  ? 'cursor-not-allowed border-gray-200 text-gray-400'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
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