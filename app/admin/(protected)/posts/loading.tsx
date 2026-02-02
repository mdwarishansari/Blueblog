// import { TableSkeleton } from '@/components/skeletons'
export default function Loading() {
  return (
    <section className="w-full max-w-full min-w-0 overflow-x-hidden space-y-8 animate-pulse">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-4 w-56 rounded bg-muted" />
        </div>

        <div className="h-10 w-32 rounded-lg bg-muted" />
      </div>

      {/* ================= FILTERS ================= */}
      <div className="rounded-2xl bg-card p-5 space-y-4">
        {/* search input */}
        <div className="h-10 w-full rounded-lg bg-muted" />

        {/* tabs */}
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 rounded-full bg-muted"
            />
          ))}
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="rounded-2xl bg-card elev-md overflow-x-auto">
        <div className="min-w-[900px] p-4 space-y-4">

          {/* table header */}
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-4 rounded bg-muted"
              />
            ))}
          </div>

          {/* table rows */}
          {Array.from({ length: 8 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-6 gap-4"
            >
              {Array.from({ length: 6 }).map((_, col) => (
                <div
                  key={col}
                  className="h-4 rounded bg-muted"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-4 w-48 rounded bg-muted" />

        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-muted" />
          <div className="h-9 w-24 rounded-lg bg-muted" />
        </div>
      </div>

    </section>
  )
}
