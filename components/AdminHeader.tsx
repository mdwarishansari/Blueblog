import AdminHeaderSkeleton from '@/components/skeletons/AdminHeaderSkeleton'

interface AdminHeaderProps {
  user: {
    name: string
    email: string
    role: string
    profileImage?: string | null
  }
  siteName?: string
  siteLogo?: string
}

// Get user initials from name
function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}


export default function AdminHeader({ user, siteName, siteLogo }: AdminHeaderProps) {
  if (!siteName && !siteLogo) {
    return <AdminHeaderSkeleton />
  }

  const hasProfileImage = user.profileImage && user.profileImage.trim() !== ''
  const initials = getUserInitials(user.name)

  return (
    <header
      className="
        hidden lg:flex
        h-16 items-center justify-between
        bg-pure-white px-6 border-b border-hairline
      "
    >
      {/* LEFT — BRAND */}
      <div className="flex items-center gap-3">
        {siteLogo && (
          <img
            src={siteLogo}
            alt="Site logo"
            className="h-9 w-9 object-contain rounded-full"
          />
        )}
        <span className="text-lg font-bold text-ink-charcoal">
          {siteName || 'Dashboard'}
        </span>
      </div>

      {/* RIGHT — USER */}
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium text-ink-charcoal">
            {user.name}
          </p>
          <p className="text-xs text-slate-gray">
            {user.role}
          </p>
        </div>

        {hasProfileImage ? (
          <img
            src={user.profileImage!}
            alt={user.name}
            className="h-9 w-9 rounded-full object-cover border border-hairline"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="
              h-9 w-9
              rounded-full
              bg-surface-ivory border border-hairline
              flex items-center justify-center
              font-semibold text-ink-charcoal text-sm
            "
          >
            {initials}
          </div>
        )}
      </div>
    </header>
  )
}
