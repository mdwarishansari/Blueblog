'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi'

export default function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const navItems = [
    { label: 'Home', href: '/' },
    { 
      label: 'Blog', 
      href: '/blog',
      children: [
        { label: 'All Posts', href: '/blog' },
        { label: 'Popular', href: '/blog?sort=popular' },
        { label: 'Latest', href: '/blog?sort=latest' },
      ]
    },
    { label: 'Categories', href: '/categories' },
    { label: 'Authors', href: '/authors' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-8">
        {navItems.map((item) => (
          <div key={item.label} className="relative group">
            {item.children ? (
              <button
                onClick={() => toggleDropdown(item.label)}
                className="flex items-center gap-1 text-gray-700 hover:text-primary-600 transition-colors"
              >
                {item.label}
                <FiChevronDown size={16} className={`transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <Link
                href={item.href}
                className={`text-gray-700 hover:text-primary-600 transition-colors ${
                  pathname === item.href ? 'text-primary-600 font-semibold' : ''
                }`}
              >
                {item.label}
              </Link>
            )}

            {/* Dropdown Menu */}
            {item.children && openDropdown === item.label && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 py-2">
                {item.children.map((child) => (
                  <Link
                    key={child.label}
                    href={child.href}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    onClick={() => setOpenDropdown(null)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 text-gray-700"
      >
        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-t md:hidden z-40">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      {item.label}
                      <FiChevronDown size={16} className={`transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {openDropdown === item.label && (
                      <div className="ml-4 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary-600 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}