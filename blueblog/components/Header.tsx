'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [siteName, setSiteName] = useState('BlueBlog')
  const [siteLogo, setSiteLogo] = useState<string | null>(null)

  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 🔥 FETCH SITE SETTINGS
  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(data => {
        setSiteName(data.siteName)
        setSiteLogo(data.siteLogo)
      })
  }, [])

  const nav = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Categories', href: '/category' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <header
      className={`sticky top-0 z-50 transition ${
        scrolled
          ? 'bg-background/90 backdrop-blur border-b'
          : 'bg-background'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* LOGO + NAME */}
          <Link href="/" className="flex items-center gap-3">
            {siteLogo && (
              <img
                src={siteLogo}
                alt="Site logo"
                className="h-8 w-8 object-contain"
              />
            )}
            <span className="text-xl font-bold">{siteName}</span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Link href="/admin/login">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <LogIn className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t"
          >
            <div className="px-4 py-4 space-y-2">
              {nav.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-4 py-2 hover:bg-muted"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
