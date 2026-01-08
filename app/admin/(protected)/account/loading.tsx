export default function Loading() {
  return (
    <div className="space-y-8 max-w-5xl animate-pulse">

      {/* ================= HEADER ================= */}
      <div className="space-y-2">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="h-4 w-80 rounded bg-muted" />
      </div>

      {/* ================= GRID ================= */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* ================= PROFILE CARD ================= */}
        <div className="rounded-2xl bg-card p-6 elev-sm space-y-6">
          <div className="h-5 w-24 rounded bg-muted" />

          {/* avatar */}
          <div className="flex items-center gap-5">
            <div className="h-24 w-24 rounded-full bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>

          {/* inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-10 w-full rounded bg-muted" />
            </div>

            <div className="space-y-2">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-10 w-full rounded bg-muted" />
            </div>

            <div className="space-y-2">
              <div className="h-3 w-12 rounded bg-muted" />
              <div className="h-20 w-full rounded bg-muted" />
            </div>
          </div>

          {/* button */}
          <div className="h-10 w-40 rounded bg-muted" />
        </div>

        {/* ================= PASSWORD CARD ================= */}
        <div className="rounded-2xl bg-card p-6 elev-sm space-y-6">
          <div className="h-5 w-36 rounded bg-muted" />

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-32 rounded bg-muted" />
                <div className="h-10 w-full rounded bg-muted" />
              </div>
            ))}
          </div>

          <div className="h-10 w-48 rounded bg-muted" />
        </div>

      </div>
    </div>
  )
}
