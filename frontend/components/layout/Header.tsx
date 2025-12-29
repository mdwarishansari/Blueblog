'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FiMenu, FiX, FiUser, FiSearch } from 'react-icons/fi'
import { useAuth } from '@/lib/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: '/category', label: 'Categories' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600">
              <span className="text-lg font-bold text-white">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {process.env.NEXT_PUBLIC_SITE_NAME || 'Blog'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isAuthenticated && (
  <nav className="items-center hidden space-x-8 md:flex">
    {navLinks.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className={`text-gray-700 hover:text-primary-600 ${
          pathname === link.href ? 'font-semibold text-primary-600' : ''
        }`}
      >
        {link.label}
      </Link>
    ))}
  </nav>
)}


          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 hover:text-primary-600"
            >
              <FiSearch size={20} />
            </button>

            {/* Replace the auth section in Header.tsx*/}
{isAuthenticated ? (
  <div className="flex items-center gap-3">
    <Link
      href="/admin/dashboard"
      className="flex items-center gap-2 btn-primary"
    >
      <FiUser size={18} />
      <span>Dashboard</span>
    </Link>
    <button
  onClick={async () => {
    await logout()

    // choose ONE
    router.replace('/admin/login') // admin apps
    // router.replace('/')          // public home

    router.refresh()
  }}
>
  Logout
</button>
  </div>
) : (
  <div className="flex items-center gap-3">
    <Link
      href="/admin/login"
      className="hidden text-gray-700 hover:text-primary-600 md:block"
    >
      Login
    </Link>
    <Link
      href="/admin/login"
      className="btn-primary"
    >
      Get Started
    </Link>
  </div>
)}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 md:hidden hover:text-primary-600"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t">
            <div className="relative max-w-md mx-auto">
              <input
                type="search"
                placeholder="Search articles, tutorials..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <FiSearch className="absolute left-4 top-3.5 text-gray-400" size={20} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="bg-white border-t md:hidden">
          <div className="container px-4 py-4 mx-auto">
            <div className="space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-2 px-4 rounded-lg transition-colors ${
                    pathname === link.href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="block px-4 py-2 rounded-lg text-primary-700 hover:bg-primary-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={async () => {
    await logout()
                        setIsMenuOpen(false)
                        router.replace('/admin/login') // admin apps
    // router.replace('/')          // public home

    router.refresh()
                      }}
                      className="block w-full px-4 py-2 text-left text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/admin/login"
                      className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/admin/login"
                      className="block px-4 py-2 mt-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}