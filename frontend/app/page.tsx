'use client'

import { useEffect, useState } from 'react'
import BlogCard from '@/components/blog/BlogCard'
import HeroSection from '@/components/home/HeroSection'
import CategoryList from '@/components/home/CategoryList'
import Loading from '@/components/ui/Loading'
import PublicPage from '@/components/guards/PublicPage'

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, categoriesRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/posts/public?limit=6&sort=publishedAt:desc`
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
        ])

        const postsJson = await postsRes.json()
        const categoriesJson = await categoriesRes.json()

        // ✅ CORRECT DATA EXTRACTION
        setPosts(postsJson?.data?.posts || [])
        setCategories(categoriesJson?.data?.categories || [])
      } catch (err) {
        console.error('Home page fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <Loading />

  return (
    <PublicPage>
      <div className="space-y-16">
        {/* Hero */}
        <HeroSection />

        {/* Categories */}
        <CategoryList categories={categories} />

        {/* Latest Posts */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Latest Articles
            </h2>
            <p className="mt-2 text-gray-600">
              Fresh insights from our editorial team
            </p>
          </div>

          {posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-500">
              No published articles yet.
            </div>
          )}
        </section>
      </div>
    </PublicPage>
  )
}
