export default function PostCardSkeleton() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-card elev-sm animate-fade-in">
      {/* top accent */}
      <div className="absolute inset-x-0 top-0 h-[3px] skeleton-gradient" />

      {/* Image */}
      <div className="h-48 w-full skeleton-enhanced" />

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Categories */}
        <div className="mb-4 flex gap-2">
          <div className="h-6 w-20 rounded-full skeleton-enhanced" />
          <div className="h-6 w-16 rounded-full skeleton-enhanced" />
        </div>

        {/* Title */}
        <div className="mb-2 h-5 w-3/4 skeleton-enhanced" />
        <div className="mb-4 h-5 w-1/2 skeleton-enhanced" />

        {/* Excerpt */}
        <div className="mb-2 h-4 w-full skeleton-enhanced" />
        <div className="mb-2 h-4 w-full skeleton-enhanced" />
        <div className="mb-6 h-4 w-2/3 skeleton-enhanced" />

        {/* Meta */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex gap-4">
            <div className="h-4 w-20 skeleton-enhanced" />
            <div className="h-4 w-24 skeleton-enhanced" />
          </div>

          <div className="h-4 w-12 skeleton-enhanced" />
        </div>
      </div>
    </div>
  )
}
