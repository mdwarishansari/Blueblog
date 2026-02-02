export default function TeamMemberSkeleton() {
  return (
    <div
      className="
        bg-card
        rounded-2xl
        p-6
        text-center
        elev-sm
        animate-pulse
      "
    >
      {/* Avatar */}
      <div className="mb-4 flex justify-center">
        <div className="h-24 w-24 rounded-full bg-muted" />
      </div>

      {/* Name */}
      <div className="mx-auto mb-2 h-5 w-32 rounded bg-muted" />

      {/* Role pill */}
      <div className="mx-auto mb-4 h-5 w-20 rounded-full bg-muted" />

      {/* Bio lines */}
      <div className="mb-4 space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 mx-auto rounded bg-muted" />
        <div className="h-3 w-4/6 mx-auto rounded bg-muted" />
      </div>

      {/* Meta */}
      <div className="mx-auto h-3 w-32 rounded bg-muted" />
    </div>
  )
}
