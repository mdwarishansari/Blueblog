import { PostCardSkeleton } from '@/components/skeletons'

export default function Loading() {
  return (
    <div className="min-h-screen bg-bg">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-muted animate-pulse" />

        <div className="relative py-24 text-center">
          <div className="mx-auto mb-4 h-10 w-64 rounded-lg bg-muted animate-pulse" />
          <div className="mx-auto h-6 w-40 rounded-lg bg-muted animate-pulse" />
        </div>
      </section>

      {/* ================= POSTS ================= */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
