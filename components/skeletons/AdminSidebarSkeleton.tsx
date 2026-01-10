export default function AdminSidebarSkeleton() {
  return (
    <aside className="flex h-full w-64 flex-col bg-white elev-lg">
      <div className="h-16 px-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded bg-muted animate-pulse" />
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
      </div>

      <div className="flex-1 px-3 py-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded-xl bg-muted/60" />
        ))}
      </div>

      <div className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        <div className="space-y-1">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-3 w-32 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </aside>
  )
}
