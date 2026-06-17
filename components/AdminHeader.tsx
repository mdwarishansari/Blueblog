import AdminHeaderSkeleton from '@/components/skeletons/AdminHeaderSkeleton'
import { Logo } from '@/components/ui/Logo'
import { UserAvatar } from '@/components/ui/UserAvatar'

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

  return (
    <header
      className="
        hidden lg:flex
        h-20 items-center justify-between
        bg-pure-white px-6 border-b border-hairline
      "
    >
      {/* LEFT — BRAND */}
      <div className="flex items-center gap-3">
        <Logo src={siteLogo} alt={siteName || 'Dashboard'} variant="admin-header" />
        <span className="text-xl font-bold text-ink-charcoal tracking-tight">
          {siteName || 'Dashboard'}
        </span>
      </div>

      {/* RIGHT — USER */}
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <p className="text-sm font-semibold text-ink-charcoal">
            {user.name}
          </p>
          <p className="text-xs text-slate-gray">
            {user.role}
          </p>
        </div>

        <UserAvatar src={user.profileImage} name={user.name} size="md" />
      </div>
    </header>
  )
}
