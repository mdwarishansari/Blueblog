import { Suspense } from 'react'
import { Filter } from 'lucide-react'
import BlogSearchInput from '@/components/blog/BlogSearchInput'
import { generateSEO } from '@/lib/seo'

import CategoriesSidebar from '@/components/CategoriesSidebar'
import BlogPostsGrid from '@/components/BlogPostsGrid'

import CategoryFilterSkeleton from '@/components/skeletons/CategoryFilterSkeleton'
import PostCardSkeleton from '@/components/skeletons/PostCardSkeleton'

export const metadata = generateSEO({
  title: 'Blog – BlueBlog Tech Articles & Tutorials',
  description:
    'Read the latest tech articles, tutorials, and developer insights on BlueBlog.',
  url: '/blog',
})


export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-bg">

      {/* ===============================
        HERO (INSTANT)
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

            {/* Search loads instantly */}
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

            {/* ================= Sidebar ================= */}
            <aside className="lg:col-span-1">
              <div className="sticky top-28">
                <div className="rounded-2xl bg-card p-6 elev-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-sm font-semibold tracking-wide text-fg">
                      Categories
                    </h3>
                    <Filter className="h-4 w-4 text-slate-400" />
                  </div>

                  <Suspense fallback={<CategoryFilterSkeleton />}>
                    <CategoriesSidebar />
                  </Suspense>
                </div>
              </div>
            </aside>

            {/* ================= Posts ================= */}
            <div className="lg:col-span-3">
              <Suspense
                fallback={
                  <div className="grid gap-8 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <PostCardSkeleton key={i} />
                    ))}
                  </div>
                }
              >
                <BlogPostsGrid
  {...(params.category ? { category: params.category } : {})}
  {...(params.q ? { q: params.q } : {})}
/>

              </Suspense>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
