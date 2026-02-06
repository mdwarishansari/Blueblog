import { Suspense } from 'react'
import { generateSEO } from '@/lib/seo'
import CategoryGrid from '@/components/CategoryGrid'
import CategoryCardSkeleton from '@/components/skeletons/CategoryCardSkeleton'
import { Grid3X3 } from 'lucide-react'

export const metadata = generateSEO({
  title: 'Categories – Browse Topics on BlueBlog',
  description:
    'Browse blog categories on BlueBlog to explore articles by topic, technology, and interest.',
  url: '/category',
})


export default function CategoriesPage() {
  return (
    <section className="min-h-screen bg-bg py-20">
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl animate-blob pointer-events-none" />
      <div className="absolute top-1/3 -left-24 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl animate-blob animation-delay-2000 pointer-events-none" />

      <div className="container relative z-10">

        {/* ✅ STATIC — loads instantly */}
        <div className="mb-16 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-indigo-700 animate-fade-in-down">
            <Grid3X3 className="h-4 w-4" />
            <span className="text-sm font-medium">Browse Topics</span>
          </div>

          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-fg animate-fade-in-up">
            Browse Categories
          </h1>
          <p className="text-lg text-slate-600 animate-fade-in-up stagger-2">
            Explore articles by topic
          </p>
        </div>

        {/* ✅ ONLY grid is delayed */}
        <Suspense
          fallback={
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <CategoryGrid />
        </Suspense>

      </div>
    </section>
  )
}
