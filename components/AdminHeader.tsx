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

// Get gradient colors based on first letter
function getAvatarGradient(name: string): string {
  const letter = name[0]?.toUpperCase() || 'A'
  const gradients: Record<string, string> = {
    A: 'from-rose-500 to-pink-600',
    B: 'from-orange-500 to-amber-600',
    C: 'from-amber-500 to-yellow-600',
    D: 'from-lime-500 to-green-600',
    E: 'from-emerald-500 to-teal-600',
    F: 'from-teal-500 to-cyan-600',
    G: 'from-cyan-500 to-sky-600',
    H: 'from-sky-500 to-blue-600',
    I: 'from-blue-500 to-indigo-600',
    J: 'from-indigo-500 to-violet-600',
    K: 'from-violet-500 to-purple-600',
    L: 'from-purple-500 to-fuchsia-600',
    M: 'from-fuchsia-500 to-pink-600',
    N: 'from-pink-500 to-rose-600',
    O: 'from-rose-500 to-red-600',
    P: 'from-red-500 to-orange-600',
    Q: 'from-orange-500 to-amber-600',
    R: 'from-amber-500 to-yellow-600',
    S: 'from-yellow-500 to-lime-600',
    T: 'from-lime-500 to-green-600',
    U: 'from-green-500 to-emerald-600',
    V: 'from-emerald-500 to-teal-600',
    W: 'from-teal-500 to-cyan-600',
    X: 'from-cyan-500 to-sky-600',
    Y: 'from-sky-500 to-blue-600',
    Z: 'from-blue-500 to-indigo-600',
  }
  return gradients[letter] || 'from-indigo-500 to-violet-600'
}

export default function AdminHeader({ user, siteName, siteLogo }: AdminHeaderProps) {
  if (!siteName && !siteLogo) {
    return <AdminHeaderSkeleton />
  }

  const hasProfileImage = user.profileImage && user.profileImage.trim() !== ''
  const initials = getUserInitials(user.name)
  const avatarGradient = getAvatarGradient(user.name)

  return (
    <header
      className="
        hidden lg:flex
        h-16 items-center justify-between
        bg-card px-6 elev-sm
        animate-fade-in
      "
    >
      {/* LEFT — BRAND */}
      <div className="flex items-center gap-3">
        {siteLogo && (
          <img
            src={siteLogo}
            alt="Site logo"
            className="h-9 w-9 object-contain"
          />
        )}
        <span className="text-lg font-semibold tracking-tight text-fg">
          {siteName || 'Dashboard'}
        </span>
      </div>

      {/* RIGHT — USER */}
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium text-fg">
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {user.role}
          </p>
        </div>

        {hasProfileImage ? (
          <img
            src={user.profileImage!}
            alt={user.name}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-md"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className={`
              h-9 w-9
              rounded-full
              bg-gradient-to-br ${avatarGradient}
              flex items-center justify-center
              font-semibold text-white text-sm
              ring-2 ring-white shadow-md
            `}
          >
            {initials}
          </div>
        )}
      </div>
    </header>
  )
}
