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

export default function AdminHeader({ user, siteName, siteLogo }: AdminHeaderProps) {
  if (!siteName && !siteLogo) {
    return <AdminHeaderSkeleton />
  }

  const avatar =
    user.profileImage && user.profileImage.trim() !== ''
      ? user.profileImage
      : '/avatars/default.png'

  return (
    <header
      className="
        hidden lg:flex
        h-16 items-center justify-between
        bg-card px-6 elev-sm
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

        <img
          src={avatar}
          alt="User avatar"
          className="h-9 w-9 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    </header>
  )
}
