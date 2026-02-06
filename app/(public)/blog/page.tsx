import { Suspense } from 'react'
import { Filter, BookOpen } from 'lucide-react'
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
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 py-20">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-200/50 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-pink-200/30 blur-2xl animate-float" />

        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-indigo-700 backdrop-blur-sm shadow-sm animate-fade-in-down">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Latest Articles</span>
            </div>

            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-fg animate-fade-in-up">
              Our Blog
            </h1>
            <p className="mb-10 text-lg text-slate-600 animate-fade-in-up stagger-2">
              Discover insights, tutorials, and stories from our team
            </p>

            {/* Search loads instantly */}
            <div className="animate-fade-in-up stagger-3">
              <BlogSearchInput />
            </div>
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
            <aside className="lg:col-span-1 animate-fade-in-left">
              <div className="sticky top-28">
                <div className="rounded-2xl bg-card p-6 elev-sm hover-glow">
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
