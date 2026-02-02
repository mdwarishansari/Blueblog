export default function Loading() {
  return (
    <div className="space-y-10 animate-pulse">

      {/* ===== HERO / WELCOME ===== */}
      <section className="rounded-2xl bg-muted p-8 h-36" />

      {/* ===== STATS ===== */}
      <section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-card p-5 space-y-3"
            >
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-8 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== RECENT ACTIVITY ===== */}
      <section className="grid gap-8 lg:grid-cols-2">

        {/* Recent Posts */}
        <div className="rounded-2xl bg-card p-6 space-y-5">
          <div className="flex justify-between">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-5 w-5 rounded bg-muted" />
          </div>

          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-white p-4 space-y-3"
            >
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Recent Messages */}
        <div className="rounded-2xl bg-card p-6 space-y-5">
          <div className="flex justify-between">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="h-5 w-5 rounded bg-muted" />
          </div>

          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border p-4 space-y-2"
            >
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </div>
          ))}
        </div>

      </section>
    </div>
  )
}
