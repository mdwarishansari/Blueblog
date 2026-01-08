export default function Loading() {
  return (
    <div className="grid gap-6 lg:grid-cols-3 animate-pulse">

      {/* ================= MAIN ================= */}
      <div className="lg:col-span-2 space-y-4">

        {/* title */}
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>

        {/* slug */}
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>

        {/* excerpt */}
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-24 w-full rounded bg-muted" />
        </div>

        {/* editor */}
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-[320px] w-full rounded-xl bg-muted" />
        </div>

        {/* back button */}
        <div className="h-9 w-40 rounded bg-muted" />
      </div>

      {/* ================= SIDEBAR ================= */}
      <div className="space-y-6">

        {/* image */}
        <div className="rounded-xl bg-card p-4 elev-sm space-y-3">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-9 w-32 rounded bg-muted" />
          <div className="h-40 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-20 w-full rounded bg-muted" />
        </div>

        {/* categories */}
        <div className="rounded-xl bg-card p-4 elev-sm space-y-3">
          <div className="h-4 w-24 rounded bg-muted" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="h-4 w-4 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* seo */}
        <div className="rounded-xl bg-card p-4 elev-sm space-y-3">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="h-2 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-20 w-full rounded bg-muted" />
        </div>

        {/* actions */}
        <div className="flex gap-2">
          <div className="h-10 flex-1 rounded bg-muted" />
          <div className="h-10 flex-1 rounded bg-muted" />
        </div>

      </div>
    </div>
  )
}
