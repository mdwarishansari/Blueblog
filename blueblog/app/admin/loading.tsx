export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded bg-muted animate-pulse" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-card elev-sm animate-pulse"
          />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-80 rounded-2xl bg-card elev-sm animate-pulse" />
        <div className="h-80 rounded-2xl bg-card elev-sm animate-pulse" />
      </div>
    </div>
  )
}
