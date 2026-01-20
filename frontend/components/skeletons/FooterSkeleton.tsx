export default function FooterSkeleton() {
  return (
    <footer className="relative mt-32 bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-20">
        <div className="grid gap-12 md:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="h-9 w-9 rounded-md bg-slate-700 animate-pulse" />

              {/* Site name */}
              <div className="h-5 w-32 rounded bg-slate-700 animate-pulse" />
            </div>

            {/* Description */}
            <div className="h-4 w-64 rounded bg-slate-800 animate-pulse" />
            <div className="h-4 w-52 rounded bg-slate-800 animate-pulse" />
          </div>

          {/* Explore (static → NO skeleton needed, but kept subtle) */}
          <div className="space-y-3">
            <div className="h-4 w-24 rounded bg-slate-800 animate-pulse" />
            <div className="h-3 w-16 rounded bg-slate-800 animate-pulse" />
            <div className="h-3 w-20 rounded bg-slate-800 animate-pulse" />
          </div>

          {/* Social icons */}
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-10 rounded-full bg-slate-700 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Bottom text */}
        <div className="mt-20 border-t border-slate-800 pt-8">
          <div className="mx-auto h-3 w-64 rounded bg-slate-800 animate-pulse" />
        </div>
      </div>
    </footer>
  )
}
