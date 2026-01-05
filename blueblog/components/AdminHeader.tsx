import { Bell } from 'lucide-react'

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

export default function AdminHeader({
  user,
  siteName,
  siteLogo,
}: AdminHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6 bg-background">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {siteLogo && (
          <img
            src={siteLogo}
            alt="Site logo"
            className="h-8 w-8 object-contain"
          />
        )}
        <span className="text-lg font-semibold">
          {siteName || 'Admin'}
        </span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <Bell className="h-5 w-5 text-muted-foreground" />

        <div className="flex items-center gap-2">
          <img
            src={user.profileImage || '/avatars/default.png'}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="text-right">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">
              {user.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
