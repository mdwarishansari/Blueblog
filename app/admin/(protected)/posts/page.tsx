import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PostTable from '@/components/PostTable'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
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
  const limit = 20
  const skip = (page - 1) * limit

  const status =
    params.status === 'PUBLISHED' || params.status === 'DRAFT'
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

  const query = new URLSearchParams({
    ...(params.search && { search: params.search }),
    ...(status && { status }),
  }).toString()

  return (
    /* 🔒 ABSOLUTE WIDTH LOCK */
    <section className="w-full max-w-full min-w-0 overflow-x-hidden space-y-8">

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

      {/* ================= FILTERS ================= */}
      <div className="rounded-2xl bg-card p-5 elev-sm space-y-4 max-w-full overflow-x-hidden">
        <PostSearchInput />

        <div className="flex flex-wrap gap-2">
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
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium ui-transition
                ${
                  tab.active
                    ? 'bg-gradient-to-r from-accentStart/20 via-accentMid/20 to-accentEnd/20 text-fg'
                    : 'text-muted-foreground hover:bg-muted'
                }
              `}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ================= TABLE ================= */}
      {/* 🔥 TABLE SCROLLS — PAGE NEVER DOES */}
      <div className="rounded-2xl bg-card elev-md overflow-x-hidden md:overflow-x-auto">
  <div className="w-full md:min-w-[900px]">
    <PostTable posts={posts} user={user} />
  </div>
</div>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {skip + 1} – {Math.min(skip + limit, total)} of {total}
          </p>

          <div className="flex gap-2">
            <Link
              href={`/admin/posts?page=${page - 1}${query ? `&${query}` : ''}`}
              aria-disabled={page === 1}
              className={`
                px-4 py-2 rounded-lg text-sm ui-transition
                ${
                  page === 1
                    ? 'pointer-events-none opacity-40 bg-muted'
                    : 'bg-card elev-sm hover:ui-lift'
                }
              `}
            >
              Previous
            </Link>

            <Link
              href={`/admin/posts?page=${page + 1}${query ? `&${query}` : ''}`}
              aria-disabled={page === totalPages}
              className={`
                px-4 py-2 rounded-lg text-sm ui-transition
                ${
                  page === totalPages
                    ? 'pointer-events-none opacity-40 bg-muted'
                    : 'bg-card elev-sm hover:ui-lift'
                }
              `}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
