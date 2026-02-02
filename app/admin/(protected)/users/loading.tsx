export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-4 w-56 rounded bg-muted" />
        </div>

        <div className="h-10 w-32 rounded-lg bg-muted" />
      </div>

      {/* Search */}
      <div className="bg-card rounded-xl p-4 elev-sm">
        <div className="h-10 w-full rounded bg-muted" />
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl elev-sm overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-5"
            >
              {/* User */}
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-40 rounded bg-muted" />
                </div>
              </div>

              {/* Role */}
              <div className="h-6 w-20 rounded-full bg-muted" />

              {/* Posts */}
              <div className="h-4 w-10 rounded bg-muted" />

              {/* Date */}
              <div className="h-4 w-20 rounded bg-muted" />

              {/* Actions */}
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded bg-muted" />
                <div className="h-8 w-8 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
