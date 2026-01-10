'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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
    .catch(() => {})
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
        bg-card backdrop-blur-xl
        transition-all
        ${scrolled ? 'shadow-[0_12px_30px_rgba(0,0,0,0.25)]' : ''}
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
  {loadingSettings ? (
    <>
      {/* Logo skeleton */}
      <div
  className="
    h-8 w-8 rounded-full
    bg-muted
    animate-pulse
    shadow-[inset_0_1px_2px_rgba(0,0,0,0.12),_0_2px_6px_rgba(0,0,0,0.12)]
  "
/>
      
      {/* Site name skeleton */}
      <div
  className="
    h-5 w-28 rounded
    bg-muted
    animate-pulse
    shadow-[inset_0_1px_2px_rgba(0,0,0,0.12),_0_2px_6px_rgba(0,0,0,0.12)]
  "
/>
    </>
  ) : (
    <>
      {siteLogo && (
        <img
          src={siteLogo}
          alt="Logo"
          className="h-8 w-8 object-contain"
        />
      )}
      <span className="text-lg sm:text-xl font-bold text-slate-900">
        {siteName}
      </span>
    </>
  )}
</Link>


          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-2 rounded-2xl bg-muted/60 p-1 shadow-inner">
            {nav.map(item => (
              <Link key={item.name} href={item.href}>
                <Button
                  size="sm"
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  className={`
                    px-4
                    ${isActive(item.href) ? 'btn-glow' : ''}
                  `}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            <Link href="/admin/login">
              <Button
                size="sm"
                className="
                  bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500
                  text-white
                  shadow-lg
                  hover:shadow-xl
                "
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>

            {/* MOBILE TOGGLE */}
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setOpen(v => !v)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* MOBILE NAV */}
      {open && (
        <div className="md:hidden border-t bg-card shadow-xl">
          <div className="mx-4 my-4 rounded-2xl bg-muted/60 p-2 space-y-1">
            {nav.map(item => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
              >
                <Button
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  className={`
                    w-full justify-start
                    ${isActive(item.href) ? 'btn-glow' : ''}
                  `}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
