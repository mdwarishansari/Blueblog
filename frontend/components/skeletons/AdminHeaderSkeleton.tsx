export default function AdminHeaderSkeleton() {
  return (
    <header className="hidden lg:flex h-16 items-center justify-between bg-card px-6 elev-sm">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded bg-muted animate-pulse" />
        <div className="h-5 w-32 rounded bg-muted animate-pulse" />
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right space-y-1">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-3 w-16 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
      </div>
    </header>
  )
}
