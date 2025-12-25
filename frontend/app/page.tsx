'use client'

import { useState, useEffect } from 'react'
import BlogCard from '@/components/blog/BlogCard'
import HeroSection from '@/components/home/HeroSection'
import CategoryList from '@/components/home/CategoryList'
import Loading from '@/components/ui/Loading'

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
    <div className="space-y-12">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Categories */}
      <CategoryList categories={categories} />
      
      {/* Featured Posts */}
      <section>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Articles</h2>
          <p className="text-gray-600">Stay updated with the latest insights and tutorials</p>
        </div>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
            <p className="text-gray-500">Check back soon for new content!</p>
          </div>
        )}
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
        <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
          Get the latest articles, tutorials, and insights delivered directly to your inbox.
        </p>
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            alert('Thanks for subscribing!')
          }}
          className="max-w-md mx-auto flex gap-2"
        >
          <input
            type="email"
            placeholder="Enter your email"
            required
            className="flex-grow px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            className="bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  )
}