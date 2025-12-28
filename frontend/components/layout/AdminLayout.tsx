'use client'

import { ReactNode, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  FiHome,
  FiFileText,
  FiFolder,
  FiImage,
  FiSettings,
  FiUser,
  FiBell,
  FiMenu,
  FiX,
  FiLogOut,
  FiHelpCircle,
} from 'react-icons/fi'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: FiHome,
    roles: ['ADMIN', 'EDITOR', 'WRITER'],
  },
  {
    name: 'Posts',
    href: '/admin/posts',
    icon: FiFileText,
    roles: ['ADMIN', 'EDITOR', 'WRITER'],
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: FiFolder,
    roles: ['ADMIN', 'EDITOR'],
  },
  {
    name: 'Media',
    href: '/admin/images',
    icon: FiImage,
    roles: ['ADMIN', 'EDITOR', 'WRITER'],
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: FiUser,
    roles: ['ADMIN'],
  },
  {
  name: 'Account',
  href: '/admin/account',
  icon: FiSettings,
  roles: ['ADMIN', 'EDITOR', 'WRITER'],
},

]



  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={`relative flex-1 flex flex-col max-w-xs w-full bg-white pt-5 pb-4 transform transition-transform ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="absolute top-0 right-0 pt-2 -mr-12">
              <button
                className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <FiX className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Sidebar content */}
            <SidebarContent
              user={user}
              navigation={navigation}
              pathname={pathname}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent
          user={user}
          navigation={navigation}
          pathname={pathname}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

interface SidebarContentProps {
  user: any
  navigation: any[]
  pathname: string
  onLogout: () => void
}

function SidebarContent({ user, navigation, pathname, onLogout }: SidebarContentProps) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center px-4 mb-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600">
            <span className="text-lg font-bold text-white">B</span>
          </div>
          <span className="text-xl font-bold text-gray-900">
            {process.env.NEXT_PUBLIC_SITE_NAME}
          </span>
        </Link>
      </div>

      {/* User profile */}
      <div className="px-4 mb-8">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
          <img
            src={user.profileImage || '/default-avatar.png'}
            alt={user.name}
            className="w-12 h-12 border rounded-full"
          />
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="inline-block px-2 py-1 mt-1 text-xs font-medium rounded bg-primary-100 text-primary-800">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon
                className={`mr-3 flex-shrink-0 h-5 w-5 ${
                  isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
              {item.name === 'Posts' && (
                <span className="px-2 py-1 ml-auto text-xs font-medium rounded bg-primary-100 text-primary-800">
                  
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 space-y-3 border-t">
        
        <button
          onClick={onLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
        >
          <FiLogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>

      {/* Version info */}
      <div className="px-4 py-3 border-t">
        <p className="text-xs text-gray-500">v1.0.0 • Admin Panel</p>
      </div>
    </>
  )
}