export default function Loading() {
  return (
    <div className="bg-gray-50 animate-pulse">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-500 py-28">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="mx-auto h-8 w-56 rounded-full bg-white/30" />
          <div className="mx-auto h-14 w-3/4 max-w-3xl rounded bg-white/30" />
          <div className="mx-auto h-5 w-2/3 max-w-xl rounded bg-white/30" />

          <div className="flex justify-center gap-4 mt-8">
            <div className="h-12 w-36 rounded-lg bg-white/40" />
            <div className="h-12 w-36 rounded-lg bg-white/20" />
          </div>
        </div>
      </section>

      {/* ================= FEATURED POSTS ================= */}
      <section className="container mx-auto py-24 px-4 bg-white">
        <div className="mb-12 flex items-center justify-between">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-8 w-20 rounded bg-muted" />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card p-4 space-y-4">
              <div className="h-40 rounded-lg bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4 text-center mb-14 space-y-4">
          <div className="mx-auto h-8 w-44 rounded bg-muted" />
          <div className="mx-auto h-10 w-64 rounded bg-muted" />
        </div>

        <div className="container mx-auto px-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card p-6 space-y-4">
              <div className="h-24 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
