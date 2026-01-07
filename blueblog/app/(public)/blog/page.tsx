import { Suspense } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import PostCard from '@/components/PostCard'
import PostCardSkeleton from '@/components/PostCardSkeleton'
import CategoryFilter from '@/components/CategoryFilter'
import { generateSEO } from '@/lib/seo'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import BlogSearchInput from '@/components/blog/BlogSearchInput'
export const metadata = generateSEO({
  title: 'Blog',
  description: 'Read the latest articles, tutorials, and insights.',
  url: '/blog',
})

async function getPosts(categorySlug?: string, q?: string) {
  const where: Prisma.PostWhereInput = {
    status: 'PUBLISHED',
    publishedAt: { lte: new Date() },
  }

  if (categorySlug) {
    where.categories = {
      some: { slug: categorySlug },
    }
  }

  if (q) {
    where.OR = [
      {
        title: {
          contains: q,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      {
        excerpt: {
          contains: q,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    ]
  }

  return prisma.post.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
      bannerImage: true,
      categories: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
  })
}


async function getCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: {
              status: 'PUBLISHED',
              publishedAt: { lte: new Date() },
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const params = await searchParams

  const [posts, categories] = await Promise.all([
  getPosts(params.category, params.q),
  getCategories(),
])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900">
              Our Blog
            </h1>
            <p className="mb-10 text-lg text-gray-600">
              Discover insights, tutorials, and stories from our team
            </p>
            
            {/* Search */}
            <BlogSearchInput />


          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Categories */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Categories</h3>
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <CategoryFilter categories={categories} />
                </div>

                {/* Newsletter */}
                <div className="rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 p-6 text-white">
                  <h3 className="mb-2 text-lg font-semibold">Stay Updated</h3>
                  <p className="mb-4 text-sm opacity-90">
                    Get the latest articles delivered to your inbox
                  </p>
                  <form className="space-y-3">
                    <Input
                      placeholder="Your email"
                      className="rounded-lg border-white/20 bg-white/10 placeholder:text-white/60 text-white"
                    />
                    <Button type="submit" className="w-full bg-white text-primary-600 hover:bg-gray-100">
                      Subscribe
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="lg:col-span-3">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {params.category ? `Posts in "${params.category}"` : 'Latest Articles'}

                  <span className="ml-2 text-primary-600">({posts.length})</span>
                </h2>
              </div>

              {posts.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2">
                  <Suspense fallback={
                    Array.from({ length: 6 }).map((_, i) => (
                      <PostCardSkeleton key={i} />
                    ))
                  }>
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </Suspense>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">No posts found</h3>
                    <p className="text-gray-600">
                      {params.category
  ? `No published posts in "${params.category}" category yet.`
  : 'No published posts available yet.'
}

                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}