export default function PostCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="h-48 w-full bg-gray-200 animate-pulse" />
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex gap-2">
          <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
        </div>
        <div className="mb-2 h-6 w-3/4 rounded bg-gray-200 animate-pulse" />
        <div className="mb-4 h-4 w-full rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-center gap-4">
            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  )
}