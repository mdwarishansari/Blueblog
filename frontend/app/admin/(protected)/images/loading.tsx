export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-muted" />
          <div className="h-4 w-56 rounded bg-muted" />
        </div>

        <div className="h-10 w-40 rounded-lg bg-muted" />
      </div>

      {/* ================= SEARCH ================= */}
      <div className="rounded-xl bg-card p-4">
        <div className="h-10 w-full rounded-lg bg-muted" />
      </div>

      {/* ================= GRID ================= */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-card overflow-hidden"
          >
            {/* image */}
            <div className="aspect-square bg-muted" />

            {/* meta */}
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />

              <div className="flex items-center justify-between pt-3">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded bg-muted" />
                  <div className="h-8 w-8 rounded bg-muted" />
                  <div className="h-8 w-8 rounded bg-muted" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
