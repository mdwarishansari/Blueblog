import { Suspense } from 'react'
import { generateSEO } from '@/lib/seo'
import CategoryGrid from '@/components/CategoryGrid'
import CategoryCardSkeleton from '@/components/skeletons/CategoryCardSkeleton'
import { Grid3X3 } from 'lucide-react'
import { Container } from '@/components/ui/Container'

export const dynamic = 'force-dynamic'

export const metadata = generateSEO({
  title: 'Categories – Browse Topics on BlueBlog',
  description:
    'Browse blog categories on BlueBlog to explore articles by topic, technology, and interest.',
  url: '/category',
})

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-canvas-cream py-12">
      <Container>
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-lavender-mist px-3.5 py-1 text-xs font-semibold text-vivid-violet shadow-sm">
            <Grid3X3 className="h-3.5 w-3.5" />
            Browse Topics
          </div>

          <h1 className="mb-4 text-3xl sm:text-[48px] font-bold tracking-tight text-ink-charcoal leading-tight">
            Browse Categories
          </h1>
          <p className="text-sm sm:text-base text-slate-gray">
            Explore articles by topic
          </p>
        </div>

        <Suspense
          fallback={
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <CategoryGrid />
        </Suspense>
      </Container>
    </div>
  )
}
