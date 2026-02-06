'use client'
import AdminSidebarSkeleton from '@/components/skeletons/AdminSidebarSkeleton'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Folder,
  Image,
  Users,
  Settings,
  MessageSquare,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  user: {
    name: string
    email: string
    role: 'ADMIN' | 'EDITOR' | 'WRITER'
    profileImage?: string | null
  }
  settings: {
    site_name?: string
    site_logo?: string
  }
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'EDITOR', 'WRITER'] },
  { name: 'Posts', href: '/admin/posts', icon: FileText, roles: ['ADMIN', 'EDITOR', 'WRITER'] },
  { name: 'Categories', href: '/admin/categories', icon: Folder, roles: ['ADMIN', 'EDITOR'] },
  { name: 'Media', href: '/admin/images', icon: Image, roles: ['ADMIN'] },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare, roles: ['ADMIN'] },
  { name: 'Users', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
  { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['ADMIN'] },
  { name: 'Account', href: '/admin/account', icon: User, roles: ['ADMIN', 'EDITOR', 'WRITER'] },
]

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

export default function AdminSidebar({ user, settings }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // ⛔ DB-driven branding not ready → show skeleton
  if (!settings?.site_name && !settings?.site_logo) {
    return <AdminSidebarSkeleton />
  }

  const hasProfileImage = user.profileImage && user.profileImage.trim() !== ''
  const initials = getUserInitials(user.name)
  const avatarGradient = getAvatarGradient(user.name)

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(user.role)
  )

  /* ===== AVATAR COMPONENT ===== */
  const UserAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' }) => {
    const sizeClasses = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'

    if (hasProfileImage) {
      return (
        <img
          src={user.profileImage!}
          alt={user.name}
          className={`${sizeClasses} rounded-full object-cover ring-2 ring-white shadow-md`}
        />
      )
    }

    return (
      <div
        className={`
          ${sizeClasses}
          rounded-full
          bg-gradient-to-br ${avatarGradient}
          flex items-center justify-center
          font-semibold text-white
          ring-2 ring-white shadow-md
        `}
      >
        {initials}
      </div>
    )
  }

  /* ===== MOBILE TOGGLE ===== */
  const MobileToggle = (
    <button
      onClick={() => setMobileOpen(true)}
      aria-label="Open sidebar"
      className="
        lg:hidden fixed top-4 left-4 z-50
        rounded-xl bg-card elev-md
        p-2 text-fg
      "
    >
      <Menu className="h-5 w-5" />
    </button>
  )

  /* ===== SIDEBAR ===== */
  const SidebarContent = (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 256 }}
      className="
        flex h-full flex-col
        bg-white elev-lg
        transition-[width] duration-300 ease-[var(--ease)]
      "
    >
      {/* TOP */}
      <div className="flex h-16 items-center justify-between px-4">
        {/* 🔥 BRAND — ONLY MOBILE/TABLET */}
        <div className="flex items-center gap-3 lg:hidden">
          {settings.site_logo && (
            <img
              src={settings.site_logo}
              alt="Site logo"
              className="h-8 w-8 object-contain"
            />
          )}
          <span className="text-lg font-semibold truncate">
            {settings.site_name || 'Dashboard'}
          </span>
        </div>

        {/* COLLAPSE BUTTON — DESKTOP ONLY */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(v => !v)}
          className="hidden lg:inline-flex"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      {/* NAV */}
      <nav className="relative flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map(item => {
          const active = pathname.startsWith(item.href)

          return (
            <motion.div
              key={item.name}
              layout
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="relative"
            >
              {active && (
                <motion.div
                  layoutId="admin-active-indicator"
                  className="
                    absolute inset-0 rounded-xl
                    bg-gradient-to-r
                    from-accentStart/20
                    via-accentMid/20
                    to-accentEnd/20
                  "
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'relative z-10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ui-transition',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* USER */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <UserAvatar />
          {!collapsed && (
            <div className="truncate">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <p className="text-xs text-primary">{user.role}</p>
            </div>
          )}
        </div>

        <form action="/api/auth/logout" method="POST" className="mt-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-5 w-5" />
            {!collapsed && 'Logout'}
          </Button>
        </form>
      </div>
    </motion.aside>
  )

  return (
    <>
      {MobileToggle}

      {/* DESKTOP */}
      <div className="hidden lg:block h-full">
        {SidebarContent}
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-64"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 rounded-xl bg-muted p-2"
              >
                <X className="h-5 w-5" />
              </button>

              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
