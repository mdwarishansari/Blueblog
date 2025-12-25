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
    <div className="mt-12 pt-8 border-t">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Related Articles</h2>
        <Link
          href="/blog"
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          View All
          <FiArrowRight />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <BlogCard key={post.id} post={post} variant="default" />
        ))}
      </div>
    </div>
  )
}