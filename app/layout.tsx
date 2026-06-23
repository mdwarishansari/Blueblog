// app/layout.tsx
import './globals.css'
// import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'react-hot-toast'
import { Inter } from 'next/font/google'
import { generateSEO } from '@/lib/seo'

const inter = Inter({ subsets: ['latin'] })

export const metadata = generateSEO()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        
          <Toaster position="top-right" />
          {children}
        
      </body>
    </html>
  )
}
