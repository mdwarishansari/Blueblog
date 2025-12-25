'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FiHome, 
  FiFileText, 
  FiFolder, 
  FiImage, 
  FiSettings, 
  FiUser,
  FiLogOut 
} from 'react-icons/fi'

interface SidebarProps {
  user: any
  onLogout: () => void
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { icon: FiHome, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: FiFileText, label: 'Posts', href: '/admin/posts' },
    { icon: FiFolder, label: 'Categories', href: '/admin/categories' },
    { icon: FiImage, label: 'Media', href: '/admin/images' },
    { icon: FiUser, label: 'Users', href: '/admin/users' },
    { icon: FiSettings, label: 'Settings', href: '/admin/settings' },
  ]

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold">
            {process.env.NEXT_PUBLIC_SITE_NAME || 'Admin'}
          </span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
            {user?.profile_image ? (
              <img src={user.profile_image} alt={user.name} className="w-full h-full rounded-full" />
            ) : (
              <span className="text-lg font-semibold">{user?.name?.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="font-medium">{user?.name}</div>
            <div className="text-sm text-gray-400">{user?.email}</div>
            <div className="text-xs px-2 py-1 bg-blue-900 text-blue-200 rounded-full inline-block mt-1">
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg w-full"
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}