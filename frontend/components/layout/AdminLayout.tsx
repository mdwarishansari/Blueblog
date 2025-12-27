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
    name: 'Settings',
    href: '/admin/settings',
    icon: FiSettings,
    roles: ['ADMIN'],
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
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <FiX className="h-6 w-6 text-white" />
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
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  type="button"
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <FiMenu className="h-6 w-6" />
                </button>
                
                <div className="ml-4">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Admin Dashboard
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                  <FiBell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <button className="p-2 text-gray-600 hover:text-gray-900">
                  <FiHelpCircle size={20} />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  <div className="relative">
                    <img
                      src={user.profile_image || '/default-avatar.png'}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
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
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold text-gray-900">
            {process.env.NEXT_PUBLIC_SITE_NAME}
          </span>
        </Link>
      </div>

      {/* User profile */}
      <div className="px-4 mb-8">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <img
            src={user.profile_image || '/default-avatar.png'}
            alt={user.name}
            className="w-12 h-12 rounded-full border"
          />
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded">
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
                <span className="ml-auto bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded">
                  24
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t px-4 py-4 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <FiHome className="mr-3 h-5 w-5 text-gray-400" />
          View Site
        </Link>
        
        <button
          onClick={onLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
        >
          <FiLogOut className="mr-3 h-5 w-5" />
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