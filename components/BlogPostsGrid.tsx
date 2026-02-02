import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import PostCard from '@/components/PostCard'
import { Search } from 'lucide-react'

export default async function BlogPostsGrid({
  category,
  q,
}: {
  category?: string
  q?: string
}) {
  const where: Prisma.PostWhereInput = {
    status: 'PUBLISHED',
    publishedAt: { lte: new Date() },
  }

  if (category) {
    where.categories = { some: { slug: category } }
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
      { excerpt: { contains: q, mode: Prisma.QueryMode.insensitive } },
    ]
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, profileImage: true } },
      bannerImage: true,
      categories: true,
    },
    orderBy: { publishedAt: 'desc' },
  })

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-14 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Search className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-fg">
            No posts found
          </h3>
          <p className="text-slate-600">
            No published posts available yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
