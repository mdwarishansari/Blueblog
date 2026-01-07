export default function Loading() {
  return (
    <div className="min-h-screen bg-bg">

      {/* ================= HERO ================= */}
      <section className="py-24 text-center">
        <div className="mx-auto mb-4 h-10 w-72 rounded-lg bg-muted animate-pulse" />
        <div className="mx-auto h-6 w-96 rounded-lg bg-muted animate-pulse" />
      </section>

      {/* ================= CONTENT ================= */}
      <section className="container py-20 grid gap-12 lg:grid-cols-2">

        {/* ================= FORM SKELETON ================= */}
        <div className="rounded-2xl bg-card p-10 space-y-6 animate-pulse">

          <div className="h-10 w-full rounded-lg bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
          <div className="h-32 w-full rounded-lg bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />

        </div>

        {/* ================= INFO SKELETON ================= */}
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl bg-card p-5 animate-pulse"
            >
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-4 w-40 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>

      </section>
    </div>
  )
}
