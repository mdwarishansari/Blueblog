import {
  PostCardSkeleton,
} from '@/components/skeletons'

export default function Loading() {
  return (
    <main className="bg-bg">
      <article className="mx-auto max-w-5xl px-6 py-14">

        {/* Banner */}
        <div className="mb-10 aspect-video rounded-2xl bg-muted animate-pulse" />

        {/* Categories */}
        <div className="mb-4 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-6 w-24 rounded-full bg-muted animate-pulse"
            />
          ))}
        </div>

        {/* Title */}
        <div className="mb-5 h-10 w-3/4 rounded bg-muted animate-pulse" />

        {/* Meta */}
        <div className="mb-12 flex gap-6">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </div>

        {/* Article body */}
        <section className="rounded-2xl bg-card p-10">
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-full rounded bg-muted animate-pulse"
              />
            ))}
          </div>
        </section>

        {/* Related articles */}
        <section className="mt-20">
          <div className="mb-8 h-6 w-48 rounded bg-muted animate-pulse" />

          <div className="grid gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Back button */}
        <div className="mt-20 flex justify-center">
          <div className="h-10 w-40 rounded bg-muted animate-pulse" />
        </div>

      </article>
    </main>
  )
}
