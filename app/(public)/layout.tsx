// app/(public)/layout.tsx
import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FooterSkeleton from '@/components/skeletons/FooterSkeleton'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />

      <main className="flex-1">{children}</main>

      {/* ✅ Footer DB skeleton */}
      <Suspense fallback={<FooterSkeleton />}>
        <Footer />
      </Suspense>
    </>
  )
}
