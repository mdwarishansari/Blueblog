export default function CategoryFilterSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="
            flex items-center justify-between
            rounded-lg px-3 py-2
            bg-muted/60
            animate-pulse
          "
        >
          {/* Category name */}
          <div className="h-4 w-24 rounded bg-muted" />

          {/* Count pill */}
          <div className="h-4 w-8 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}
