export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="h-10 w-10 rounded-full bg-indigo-500/30" />
        <div className="h-4 w-32 rounded bg-muted" />
      </div>
    </div>
  )
}
