export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-muted" />
          <div className="h-4 w-56 rounded bg-muted" />
        </div>

        <div className="h-10 w-36 rounded-lg bg-muted" />
      </div>

      {/* ================= SEARCH ================= */}
      <div className="max-w-sm">
        <div className="h-10 w-full rounded-lg bg-muted" />
      </div>

      {/* ================= LIST ================= */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card px-5 py-4"
          >
            {/* left */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-11 w-11 rounded-lg bg-muted" />

              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-40 rounded bg-muted" />
              </div>
            </div>

            {/* right */}
            <div className="flex items-center gap-4">
              <div className="h-4 w-16 rounded bg-muted" />

              <div className="flex gap-2">
                <div className="h-8 w-8 rounded bg-muted" />
                <div className="h-8 w-8 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
