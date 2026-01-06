'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
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

/* 🔐 FINAL ROLE-BASED NAV */
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

export default function AdminSidebar({ user, settings }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const avatar =
    user.profileImage && user.profileImage.trim() !== ''
      ? user.profileImage
      : '/avatars/default.png'

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(user.role)
  )

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '5rem' : '16rem' }}
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background shadow-lg lg:relative',
        isCollapsed ? 'lg:w-20' : 'lg:w-64'
      )}
    >
      {/* LOGO */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <img
              src={settings.site_logo || '/logo-placeholder.png'}
              alt="Site Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-lg font-bold truncate">
              {settings.site_name || 'Site'}
            </span>
          </Link>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:inline-flex"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      {/* NAV */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {filteredNavigation.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {!isCollapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {/* USER */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt="User avatar"
            className="h-10 w-10 rounded-full object-cover border"
            referrerPolicy="no-referrer"
          />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-primary">{user.role}</p>
            </div>
          )}
        </div>

        <form action="/api/auth/logout" method="POST" className="mt-4">
          <Button variant="ghost" className="w-full justify-start text-red-600">
            <LogOut className="mr-2 h-5 w-5" /> Logout
          </Button>
        </form>
      </div>
    </motion.aside>
  )
}
