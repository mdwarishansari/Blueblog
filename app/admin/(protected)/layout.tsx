import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: {
    default: 'BlueBlog',
    template: '%s | BlueBlog',
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  /* ================= AUTH ================= */
  const sessionUser = await getCurrentUser()
  if (!sessionUser) redirect('/admin/login')

  /* ================= USER ================= */
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      name: true,
      email: true,
      role: true,
      profileImage: true,
    },
  })

  if (!user) redirect('/admin/login')

  /* ================= SETTINGS ================= */
  const rows = await prisma.setting.findMany()
  const settings: Record<string, any> = {}

  for (const row of rows) {
    settings[row.key] =
      row.key === 'social_links'
        ? JSON.parse(row.value || '{}')
        : row.value
  }

  /* ================= LAYOUT ================= */
  return (
    <div className="flex h-screen">
      <AdminSidebar
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
        }}
        settings={{
          site_name: settings['site_name'],
          site_logo: settings['site_logo'],
        }}
      />

      <div className="flex flex-1 flex-col">
        <AdminHeader
          user={{
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
          }}
          siteName={settings['site_name']}
          siteLogo={settings['site_logo']}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
