'use client'

import { ReactNode, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import {
  FiHome,
  FiFileText,
  FiFolder,
  FiImage,
  FiSettings,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
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
      roles: ['ADMIN'],
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
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ================= MOBILE SIDEBAR ================= */}
      <div className="lg:hidden">
        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex justify-end p-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <FiX size={20} />
            </button>
          </div>

          <SidebarContent
            user={user}
            navigation={navigation}
            pathname={pathname}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-white">
        <SidebarContent
          user={user}
          navigation={navigation}
          pathname={pathname}
          onLogout={handleLogout}
        />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <FiMenu size={22} />
          </button>
          <span className="text-sm font-semibold">Admin Panel</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

/* ================= SIDEBAR CONTENT ================= */

interface SidebarContentProps {
  user: any
  navigation: any[]
  pathname: string
  onLogout: () => void
}

function SidebarContent({
  user,
  navigation,
  pathname,
  onLogout,
}: SidebarContentProps) {
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

      {/* User */}
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
        {navigation
          .filter(item => item.roles.includes(user.role))
          .map(item => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            )
          })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t">
        <button
          onClick={onLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
        >
          <FiLogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>

      {/* Version */}
      <div className="px-4 py-3 border-t">
        <p className="text-xs text-gray-500">v1.0.0 • Admin Panel</p>
      </div>
    </>
  )
}
