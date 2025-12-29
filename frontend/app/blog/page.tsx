'use client'

import { useEffect, useState } from 'react'
import BlogCard from '@/components/blog/BlogCard'

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/public?status=PUBLISHED`,
          { cache: 'no-store' }
        )

        const json = await res.json()
        setPosts(json.data.posts || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return <div className="py-24 text-center text-gray-500">Loading blogs…</div>
  }

  return (
    <div className="px-4 py-12 mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-gray-900">
          Blog
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600">
          Read our latest articles, tutorials, and insights.
        </p>
      </div>

      {/* Blog Grid */}
      {posts.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          No published posts yet.
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any) => (
            <BlogCard
              key={post.id}
              post={{
                ...post,
                banner_image: post.bannerImage
                  ? {
                      url: post.bannerImage.url,
                      alt_text: post.bannerImage.altText,
                    }
                  : null,
                published_at: post.publishedAt,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
