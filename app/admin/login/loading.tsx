export default function Loading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-100 px-4 flex items-center justify-center animate-pulse">

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-400/30 blur-3xl" />

      {/* Soft center glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-white/40 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-muted" />
          <div className="mx-auto h-6 w-32 rounded bg-muted" />
          <div className="mx-auto mt-2 h-4 w-40 rounded bg-muted" />
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl space-y-6">

          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-10 w-full rounded bg-muted" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-10 w-full rounded bg-muted" />
          </div>

          <div className="h-11 w-full rounded-lg bg-muted" />
        </div>

        {/* Back link */}
        <div className="mt-8 flex justify-center">
          <div className="h-4 w-28 rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
