export default function PostCardSkeleton() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-card elev-sm">
      {/* top accent */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-muted animate-pulse" />

      {/* Image */}
      <div className="h-48 w-full bg-muted animate-pulse" />

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Categories */}
        <div className="mb-4 flex gap-2">
          <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
          <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
        </div>

        {/* Title */}
        <div className="mb-2 h-5 w-3/4 rounded bg-muted animate-pulse" />
        <div className="mb-4 h-5 w-1/2 rounded bg-muted animate-pulse" />

        {/* Excerpt */}
        <div className="mb-2 h-4 w-full rounded bg-muted animate-pulse" />
        <div className="mb-2 h-4 w-full rounded bg-muted animate-pulse" />
        <div className="mb-6 h-4 w-2/3 rounded bg-muted animate-pulse" />

        {/* Meta */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex gap-4">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          </div>

          <div className="h-4 w-12 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  )
}
