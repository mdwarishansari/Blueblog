export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">

      {/* ================= HEADER ================= */}
      <div className="space-y-2">
        <div className="h-6 w-56 rounded bg-muted" />
        <div className="h-4 w-80 rounded bg-muted" />
      </div>

      {/* ================= MESSAGE CARDS ================= */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="relative rounded-2xl bg-card p-5 elev-sm"
          >
            {/* unread bar */}
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-muted" />

            {/* header row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-3 w-52 rounded bg-muted" />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-3 w-32 rounded bg-muted" />
                <div className="h-8 w-8 rounded bg-muted" />
              </div>
            </div>

            {/* message body */}
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-11/12 rounded bg-muted" />
              <div className="h-3 w-10/12 rounded bg-muted" />
            </div>

            {/* badge */}
            <div className="mt-4">
              <div className="h-6 w-20 rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
