export default function CategoryCardSkeleton() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-card elev-sm">
      {/* top accent */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-muted animate-pulse" />

      {/* Media */}
      <div className="h-48 w-full bg-muted animate-pulse" />

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Meta pill */}
        <div className="mb-4 h-6 w-24 rounded-full bg-muted animate-pulse" />

        {/* Title */}
        <div className="mb-2 h-5 w-2/3 rounded bg-muted animate-pulse" />

        {/* Count */}
        <div className="mb-6 h-4 w-1/3 rounded bg-muted animate-pulse" />

        {/* CTA */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-200/60 pt-4">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-5 w-5 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  )
}
