import { PageHeaderSkeleton } from '@/components/skeletons'

export default function Loading() {
  return (
    <section className="min-h-screen bg-bg py-20">
      <div className="container">

        {/* Header */}
        <div className="mb-16 text-center">
          <PageHeaderSkeleton />
        </div>

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-muted animate-pulse"
            />
          ))}
        </div>

      </div>
    </section>
  )
}
