import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sessionUser = await getCurrentUser()
  if (!sessionUser) redirect('/admin/login')

  const ROLE_ROUTE_RULES: Record<string, RegExp[]> = {
    ADMIN: [/^\/admin/],
    EDITOR: [
      /^\/admin\/dashboard/,
      /^\/admin\/posts/,
      /^\/admin\/categories/,
      /^\/admin\/messages/,
      /^\/admin\/account/,
    ],
    WRITER: [
      /^\/admin\/dashboard/,
      /^\/admin\/posts/,
      /^\/admin\/account/,
    ],
  }

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

  // 🔒 ROLE-BASED PAGE ACCESS CHECK (THIS WAS MISSING)
  const headersList = await headers()
const pathname = headersList.get('x-pathname') || ''

  const allowedRoutes = ROLE_ROUTE_RULES[user.role] || []
  const isAllowed = allowedRoutes.some((regex) => regex.test(pathname))

  if (!isAllowed) {
    redirect('/admin/dashboard')
  }

  // ✅ fetch settings ONCE
  const rows = await prisma.setting.findMany()
  const settings: Record<string, any> = {}

  for (const row of rows) {
    settings[row.key] =
      row.key === 'social_links' ? JSON.parse(row.value) : row.value
  }

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

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
