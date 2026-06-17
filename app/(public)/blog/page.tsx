import { Suspense } from 'react'
import { Filter, BookOpen } from 'lucide-react'
import BlogSearchInput from '@/components/blog/BlogSearchInput'
import { generateSEO } from '@/lib/seo'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'

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
    <div className="min-h-screen bg-canvas-cream">
      
      {/* ===============================
        HERO
      =============================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-canvas-cream to-lavender-mist/50 py-16 border-b border-hairline">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-pure-white border border-hairline px-3.5 py-1 text-xs font-semibold text-vivid-violet shadow-sm">
              <BookOpen className="h-3.5 w-3.5" />
              Latest Articles
            </div>

            <h1 className="mb-4 text-3xl sm:text-[48px] font-bold tracking-tight text-ink-charcoal leading-tight">
              Our Blog
            </h1>
            <p className="mb-8 text-sm sm:text-base text-slate-gray">
              Discover insights, tutorials, and stories from our team
            </p>

            {/* Search */}
            <BlogSearchInput />
          </div>
        </Container>
      </section>

      {/* ===============================
         CONTENT
      =============================== */}
      <Section className="py-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-4">

            {/* ================= Sidebar ================= */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <Card variant="white" className="p-6">
                  <div className="mb-4 flex items-center justify-between border-b border-hairline pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-charcoal">
                      Categories
                    </h3>
                    <Filter className="h-4 w-4 text-slate-gray" />
                  </div>

                  <Suspense fallback={<CategoryFilterSkeleton />}>
                    <CategoriesSidebar />
                  </Suspense>
                </Card>
              </div>
            </aside>

            {/* ================= Posts ================= */}
            <div className="lg:col-span-3">
              <Suspense
                fallback={
                  <div className="grid gap-6 md:grid-cols-2">
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
        </Container>
      </Section>
    </div>
  )
}
