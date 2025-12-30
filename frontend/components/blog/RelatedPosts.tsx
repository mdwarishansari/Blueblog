"use client"
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import BlogCard from './BlogCard'

interface RelatedPostsProps {
  posts: any[]
  currentPostId: string
}

export default function RelatedPosts({ posts, currentPostId }: RelatedPostsProps) {
  // Filter out current post and take up to 3 related posts
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, 3)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <div className="pt-8 mt-12 border-t">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Related Articles</h2>
        <Link
          href="/blog"
          className="flex items-center gap-2 font-medium text-primary-600 hover:text-primary-700"
        >
          View All
          <FiArrowRight />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {relatedPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}