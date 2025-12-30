'use client'

import { ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SEO from '@/components/seo/SEO'
import { useAuth } from '@/lib/context/AuthContext'

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  const isAdminRoute = pathname.startsWith('/admin')

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1024)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  /**
   * HEADER RULES (FINAL, CORRECT)
   *
   * Desktop:
   *  - Public pages → show header
   *  - Admin pages → hide header
   *
   * Mobile:
   *  - Not logged in → show header (login visible)
   *  - Logged in → hide header (admin sidebar handles nav)
   */
  const showHeader =
    !isAdminRoute &&
    (!isMobile || !isAuthenticated)

  return (
    <>
      <SEO />

      {showHeader && <Header />}

      <main className="container flex-1 px-4 py-8 mx-auto">
        {children}
      </main>

      {!isAdminRoute && <Footer />}
    </>
  )
}
