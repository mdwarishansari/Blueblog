import { PostCardSkeleton } from '@/components/skeletons'

export default function Loading() {
  return (
    <main className="relative min-h-screen bg-bg overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-200/40 via-violet-200/30 to-pink-200/20 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-gradient-to-tr from-pink-200/30 via-violet-200/20 to-indigo-200/30 blur-3xl animate-blob animation-delay-2000" />
      </div>

      <article className="relative mx-auto max-w-5xl px-6 py-14">

        {/* Banner Skeleton */}
        <div className="mb-10 aspect-video rounded-3xl skeleton-gradient" />

        {/* Categories Skeleton */}
        <div className="mb-5 flex flex-wrap gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 rounded-full skeleton-enhanced"
            />
          ))}
        </div>

        {/* Title Skeleton */}
        <div className="mb-6 space-y-3">
          <div className="h-12 w-4/5 rounded-xl skeleton-enhanced" />
          <div className="h-12 w-2/3 rounded-xl skeleton-enhanced" />
        </div>

        {/* Meta Skeleton */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="h-12 w-40 rounded-full skeleton-enhanced" />
          <div className="h-12 w-36 rounded-full skeleton-enhanced" />
          <div className="h-12 w-32 rounded-full skeleton-enhanced" />
        </div>

        {/* Excerpt Skeleton */}
        <div className="mb-10 rounded-2xl bg-gradient-to-r from-indigo-50/50 via-violet-50/50 to-pink-50/50 p-8">
          <div className="space-y-3">
            <div className="h-5 w-full rounded skeleton-enhanced" />
            <div className="h-5 w-4/5 rounded skeleton-enhanced" />
          </div>
        </div>

        {/* Article Content Skeleton */}
        <section className="rounded-3xl bg-card p-12 elev-sm">
          <div className="space-y-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 rounded skeleton-enhanced ${i % 5 === 0 ? 'w-1/3 h-7' :
                    i % 4 === 0 ? 'w-4/5' :
                      i % 3 === 0 ? 'w-3/4' : 'w-full'
                  }`}
              />
            ))}
          </div>
        </section>

        {/* Share Section Skeleton */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="h-4 w-32 rounded skeleton-enhanced" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-20 rounded-full skeleton-enhanced" />
            ))}
          </div>
        </div>

        {/* Related Articles Skeleton */}
        <section className="mt-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-8 w-48 rounded skeleton-enhanced" />
            <div className="flex-1 h-[2px] bg-gradient-to-r from-indigo-500/30 via-violet-500/20 to-transparent rounded-full" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Back Button Skeleton */}
        <div className="mt-20 flex justify-center">
          <div className="h-12 w-40 rounded-xl skeleton-enhanced" />
        </div>

      </article>
    </main>
  )
}
