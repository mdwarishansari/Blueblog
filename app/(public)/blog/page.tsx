import { Search, Filter } from 'lucide-react'
import PostCard from '@/components/PostCard'
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

/* -------------------------------------
   DATA
------------------------------------- */
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
  return prisma.category.findMany({
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
    orderBy: { name: 'asc' },
  })
}

/* -------------------------------------
   PAGE
------------------------------------- */
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
    <div className="min-h-screen bg-bg">

      {/* ===============================
         HERO
      =============================== */}
      <section className="bg-bg py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-fg">
              Our Blog
            </h1>
            <p className="mb-10 text-lg text-slate-600">
              Discover insights, tutorials, and stories from our team
            </p>

            <BlogSearchInput />
          </div>
        </div>
      </section>

      {/* ===============================
         CONTENT
      =============================== */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-4">

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                <div className="rounded-2xl bg-card p-6 elev-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-sm font-semibold tracking-wide text-fg">
                      Categories
                    </h3>
                    <Filter className="h-4 w-4 text-slate-400" />
                  </div>

                  <CategoryFilter categories={categories} />
                </div>
              </div>
            </aside>

            {/* Posts */}
            <main className="lg:col-span-3">
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-fg">
                  {params.category
                    ? `Posts in “${params.category}”`
                    : 'Latest Articles'}

                  <span className="ml-2 text-indigo-600">
                    ({posts.length})
                  </span>
                </h2>
              </div>

              {posts.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2">
                  {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-14 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <Search className="h-7 w-7 text-slate-400" />
                    </div>

                    <h3 className="mb-2 text-xl font-semibold text-fg">
                      No posts found
                    </h3>

                    <p className="text-slate-600">
                      {params.category
                        ? `No published posts in “${params.category}” yet.`
                        : 'No published posts available yet.'}
                    </p>
                  </div>
                </div>
              )}
            </main>

          </div>
        </div>
      </section>
    </div>
  )
}
