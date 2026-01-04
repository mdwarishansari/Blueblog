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
  LogOut
} from 'lucide-react'
import { User as UserType } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  user: Pick<UserType, 'name' | 'email' | 'role' | 'profileImage'>
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'EDITOR', 'WRITER'] },
  { name: 'Posts', href: '/admin/posts', icon: FileText, roles: ['ADMIN', 'EDITOR', 'WRITER'] },
  { name: 'Categories', href: '/admin/categories', icon: Folder, roles: ['ADMIN', 'EDITOR'] },
  { name: 'Media', href: '/admin/images', icon: Image, roles: ['ADMIN', 'EDITOR', 'WRITER'] },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare, roles: ['ADMIN', 'EDITOR'] },
  { name: 'Users', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
  { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['ADMIN'] },
  { name: 'Account', href: '/admin/account', icon: User, roles: ['ADMIN', 'EDITOR', 'WRITER'] },
]

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isCollapsed && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? '5rem' : '16rem',
          x: isCollapsed ? '-16rem' : '0',
        }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white shadow-lg transition-all duration-300 lg:relative lg:translate-x-0',
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400" />
              <span className="text-xl font-bold text-gray-900">BlueBlog</span>
              <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800">
                Admin
              </span>
            </Link>
          )}
          {isCollapsed && (
            <div className="mx-auto h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:inline-flex"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t p-4">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-400" />
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
                <p className="truncate text-xs text-gray-500">{user.email}</p>
                <p className="mt-1 text-xs font-medium text-primary-600">{user.role}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-400" />
            </div>
          )}

          {/* Logout Button */}
          <form action="/api/auth/logout" method="POST" className={cn('mt-4', isCollapsed && 'flex justify-center')}>
            <Button
              type="submit"
              variant="ghost"
              size={isCollapsed ? "icon" : "default"}
              className={cn(
                'w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600',
                isCollapsed && 'justify-center'
              )}
            >
              <LogOut className={cn('h-5 w-5', !isCollapsed && 'mr-2')} />
              {!isCollapsed && 'Logout'}
            </Button>
          </form>
        </div>
      </motion.aside>
    </>
  )
}