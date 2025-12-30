"use client"
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary-600"></div>
        <div className="mt-4 text-gray-600">Loading...</div>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div className="inline-block border-t-2 border-b-2 rounded-full animate-spin border-primary-600"
        style={{ width: size, height: size }}></div>
  )
}

export function LoadingCard() {
  return (
    <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl animate-pulse">
      <div className="bg-gray-200 aspect-video"></div>
      <div className="p-6">
        <div className="h-4 mb-4 bg-gray-200 rounded"></div>
        <div className="h-4 mb-4 bg-gray-200 rounded"></div>
        <div className="w-3/4 h-4 mb-6 bg-gray-200 rounded"></div>
        <div className="flex justify-between">
          <div className="w-20 h-3 bg-gray-200 rounded"></div>
          <div className="w-16 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="w-48 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )
}