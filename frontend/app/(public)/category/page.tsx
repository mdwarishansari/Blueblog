import { Suspense } from 'react'
import { generateSEO } from '@/lib/seo'
import CategoryGrid from '@/components/CategoryGrid'
import CategoryCardSkeleton from '@/components/skeletons/CategoryCardSkeleton'

export const metadata = generateSEO({
  title: 'Categories – Browse Topics on BlueBlog',
  description:
    'Browse blog categories on BlueBlog to explore articles by topic, technology, and interest.',
  url: '/category',
})


export default function CategoriesPage() {
  return (
    <section className="min-h-screen bg-bg py-20">
      <div className="container">

        {/* ✅ STATIC — loads instantly */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-fg">
            Browse Categories
          </h1>
          <p className="text-lg text-slate-600">
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
