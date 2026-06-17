'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [siteName, setSiteName] = useState('BlueBlog')
  const [siteLogo, setSiteLogo] = useState<string | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(true)


  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Site settings */
  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(d => {
        if (d?.siteName) setSiteName(d.siteName)
        if (d?.siteLogo) setSiteLogo(d.siteLogo)
      })
      .catch(() => { })
      .finally(() => setLoadingSettings(false))
  }, [])


  const nav = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Categories', href: '/category' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <header
      className={`
        sticky top-0 z-50
        bg-pure-white border-b border-hairline
        transition-all duration-300
        ${scrolled ? 'shadow-sm' : ''}
      `}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <Logo
              src={loadingSettings ? undefined : siteLogo}
              alt={siteName}
              variant="header"
            />
            {loadingSettings ? (
              <div className="h-6 w-32 rounded-full bg-surface-ivory animate-pulse" />
            ) : (
              <span className="text-xl font-bold text-ink-charcoal tracking-tight">
                {siteName}
              </span>
            )}
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-1.5">
            {nav.map(item => (
              <Link key={item.name} href={item.href}>
                <Button
                  size="sm"
                  variant={isActive(item.href) ? 'secondary' : 'ghost'}
                  className={`
                    px-4 h-9 text-sm font-medium rounded-full
                    ${isActive(item.href) ? 'text-ink-charcoal bg-surface-ivory border-hairline' : 'text-slate-gray'}
                  `}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            {/* Register Button */}
            <Link href="/register" className="hidden sm:block">
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-4 rounded-full border-hairline text-ink-charcoal hover:bg-canvas-cream"
              >
                Register
              </Button>
            </Link>

            {/* Login Button */}
            <Link href="/login">
              <Button
                size="sm"
                variant="default"
                className="h-9 px-4 rounded-full"
              >
                Login
              </Button>
            </Link>

            {/* MOBILE TOGGLE */}
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden h-9 w-9"
              onClick={() => setOpen(v => !v)}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* MOBILE NAV */}
      {open && (
        <div className="md:hidden border-t border-hairline bg-pure-white shadow-lg">
          <div className="mx-4 my-4 p-2 space-y-1 rounded-[16px] bg-surface-ivory border border-hairline">
            {nav.map(item => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
              >
                <Button
                  variant={isActive(item.href) ? 'secondary' : 'ghost'}
                  className="w-full justify-start rounded-full"
                >
                  {item.name}
                </Button>
              </Link>
            ))}

            {/* Mobile Register Link */}
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-ink-charcoal"
              >
                Register
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
