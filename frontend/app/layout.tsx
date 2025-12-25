import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SEO from '@/components/seo/SEO'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_SITE_NAME || 'TechBlog Pro',
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME || 'TechBlog Pro'}`
  },
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern, SEO-optimized blogging platform',
  keywords: ['blog', 'technology', 'programming', 'web development', 'SEO'],
  authors: [{ name: 'TechBlog Team' }],
  creator: 'TechBlog Pro',
  publisher: 'TechBlog Pro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'TechBlog Pro',
    title: process.env.NEXT_PUBLIC_SITE_NAME || 'TechBlog Pro',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern, SEO-optimized blogging platform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TechBlog Pro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: process.env.NEXT_PUBLIC_SITE_NAME || 'TechBlog Pro',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern, SEO-optimized blogging platform',
    images: ['/og-image.png'],
    creator: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <SEO />
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}