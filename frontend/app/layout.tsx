import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/context/AuthContext'
import AppShell from '@/components/layout/AppShell'
// export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_SITE_NAME || 'TechBlog Pro',
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME || 'TechBlog Pro'}`
  },
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'A modern, SEO-optimized blogging platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
