'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { apiGet } from '@/lib/api'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<{ site_name?: string; site_logo?: string }>({})

  useEffect(() => {
    Promise.all([apiGet('/auth/me'), apiGet('/settings/site-info')])
      .then(([meRes, siteRes]) => {
        const me = meRes.data?.user || meRes.user || meRes.data || meRes
        const site = siteRes.data || siteRes

        if (!me) {
          router.replace('/admin/login')
          return
        }

        setUser(me)
        setSettings({
          site_name: site.siteName || site.site_name,
          site_logo: site.siteLogo || site.site_logo,
        })
      })
      .catch(() => router.replace('/admin/login'))
  }, [router])

  return (
    <div className="flex h-screen">
      {user && (
        <AdminSidebar
          user={{
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
          }}
          settings={settings}
        />
      )}

      <div className="flex flex-1 flex-col">
        {user && (
          <AdminHeader
            user={{
              name: user.name,
              email: user.email,
              role: user.role,
              profileImage: user.profileImage,
            }}
            {...(settings.site_name ? { siteName: settings.site_name } : {})}
            {...(settings.site_logo ? { siteLogo: settings.site_logo } : {})}
          />
        )}

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
