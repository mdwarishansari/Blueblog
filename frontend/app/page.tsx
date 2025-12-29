'use client'

import { useState, useEffect } from 'react'
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
    async function fetchData() {
      try {
        const [postsRes, categoriesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts?status=PUBLISHED&limit=6&sort=-published_at`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
        ])

        const postsData = await postsRes.json()
        const categoriesData = await categoriesRes.json()

        setPosts(postsData.data || [])
        setCategories(categoriesData.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <PublicPage>
    <div className="space-y-12">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Categories */}
      <CategoryList categories={categories} />
      
      {/* Featured Posts */}
      <section>
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">Latest Articles</h2>
          <p className="text-gray-600">Stay updated with the latest insights and tutorials</p>
        </div>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <h3 className="mb-2 text-xl font-semibold text-gray-700">No posts yet</h3>
            <p className="text-gray-500">Check back soon for new content!</p>
          </div>
        )}
      </section>
      
      
    </div>
    </PublicPage>
  )
}