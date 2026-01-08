export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">

      {/* Header */}
      <div className="space-y-2">
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ================= GENERAL SETTINGS ================= */}
        <div className="bg-card rounded-2xl p-6 space-y-6 elev-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted" />
            </div>
          </div>

          {/* logo */}
          <div className="space-y-3">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="flex gap-6">
              <div className="h-40 w-40 rounded-2xl bg-muted" />
              <div className="space-y-3">
                <div className="h-10 w-32 rounded bg-muted" />
                <div className="h-3 w-40 rounded bg-muted" />
              </div>
            </div>
          </div>

          {/* inputs */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-10 w-full rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* ================= SOCIAL LINKS ================= */}
        <div className="bg-card rounded-2xl p-6 space-y-6 elev-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-40 rounded bg-muted" />
            </div>
          </div>

          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-10 w-full rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* ================= FOOTER ================= */}
        <div className="bg-card rounded-2xl p-6 space-y-6 elev-sm lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-28 w-full rounded bg-muted" />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <div className="h-10 w-40 rounded bg-muted" />
      </div>
    </div>
  )
}
