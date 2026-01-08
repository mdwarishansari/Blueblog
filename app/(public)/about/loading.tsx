import { PostCardSkeleton } from '@/components/skeletons'

export default function Loading() {
  return (
    <div className="min-h-screen bg-bg">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-muted animate-pulse" />
        <div className="relative container text-center">
          <div className="mx-auto mb-6 h-10 w-72 rounded-lg bg-muted animate-pulse" />
          <div className="mx-auto h-6 w-96 rounded-lg bg-muted animate-pulse" />
        </div>
      </section>

      {/* ================= MISSION & VISION ================= */}
      <section className="py-20">
        <div className="container grid gap-14 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-6">
              <div className="h-6 w-40 rounded-full bg-muted animate-pulse" />
              <div className="h-8 w-3/4 rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="bg-card py-20">
        <div className="container">
          <div className="mx-auto mb-14 h-8 w-64 rounded-lg bg-muted animate-pulse" />

          <div className="grid gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-muted p-8 animate-pulse"
              >
                <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-slate-300" />
                <div className="mx-auto mb-4 h-5 w-40 rounded bg-slate-300" />
                <div className="h-4 w-full rounded bg-slate-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TEAM ================= */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto mb-14 h-8 w-64 rounded-lg bg-muted animate-pulse" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20">
        <div className="container">
          <div className="rounded-3xl bg-muted p-14 text-center animate-pulse">
            <div className="mx-auto mb-6 h-8 w-72 rounded bg-slate-300" />
            <div className="mx-auto mb-10 h-5 w-96 rounded bg-slate-300" />
            <div className="mx-auto h-10 w-40 rounded-lg bg-slate-300" />
          </div>
        </div>
      </section>

    </div>
  )
}
