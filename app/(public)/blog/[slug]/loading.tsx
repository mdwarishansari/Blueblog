import { PostCardSkeleton } from '@/components/skeletons'

export default function Loading() {
  return (
    <main className="bg-bg">
      <article className="mx-auto max-w-5xl px-6 py-14">

        {/* Banner */}
        <div className="mb-10 aspect-video rounded-2xl bg-muted/70 animate-pulse shadow-inner" />

        {/* Categories */}
        <div className="mb-6 flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-24 rounded-full bg-muted animate-pulse"
            />
          ))}
        </div>

        {/* Title */}
        <div className="mb-6 space-y-3">
          <div className="h-10 w-3/4 rounded-lg bg-muted animate-pulse" />
          <div className="h-10 w-1/2 rounded-lg bg-muted animate-pulse" />
        </div>

        {/* Meta */}
        <div className="mb-12 flex flex-wrap gap-6">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </div>

        {/* Article body */}
        <section className="rounded-2xl bg-card p-10 elev-sm">
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 rounded bg-muted animate-pulse ${
                  i % 4 === 0 ? 'w-4/5' : 'w-full'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Related Articles */}
        <section className="mt-20">
          <div className="mb-8 h-7 w-52 rounded bg-muted animate-pulse" />

          <div className="grid gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Back Button */}
        <div className="mt-20 flex justify-center">
          <div className="h-11 w-44 rounded-xl bg-muted animate-pulse" />
        </div>

      </article>
    </main>
  )
}
