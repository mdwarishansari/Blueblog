"use client"
import Link from 'next/link'
import { FiCalendar, FiUser, FiClock, FiArrowRight } from 'react-icons/fi'
import { formatDate } from '@/lib/utils/formatDate'
import Image from 'next/image'

interface BlogCardProps {
  post: any
  variant?: 'default' | 'compact' | 'featured'
}

export default function BlogCard({ post, variant = 'default' }: BlogCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group block hover:bg-gray-50 p-4 rounded-lg transition-colors"
      >
        <div className="flex items-start gap-4">
          {post.banner_image && (
            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={post.banner_image.url}
                alt={post.banner_image.alt_text || post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 truncate">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <FiCalendar size={12} />
                {formatDate(post.published_at)}
              </span>
              <span className="flex items-center gap-1">
                <FiUser size={12} />
                {post.author?.name}
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
      >
        {post.banner_image && (
          <div className="aspect-video relative overflow-hidden bg-gray-100">
            <img
              src={post.banner_image.url}
              alt={post.banner_image.alt_text || post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            {post.categories?.slice(0, 2).map((category: any) => (
              <span
                key={category.id}
                className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
              >
                {category.name}
              </span>
            ))}
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary-300 transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-200 line-clamp-2 mb-3">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <img
                src={post.author?.profile_image || '/default-avatar.png'}
                alt={post.author?.name}
                className="w-6 h-6 rounded-full"
              />
              <span>{post.author?.name}</span>
            </div>
            <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1"
    >
      {post.banner_image && (
        <div className="aspect-video relative overflow-hidden bg-gray-100">
          <img
            src={post.banner_image.url}
            alt={post.banner_image.alt_text || post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            {post.categories?.[0] && (
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
                {post.categories[0].name}
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <FiCalendar size={14} />
              <span>{formatDate(post.published_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiUser size={14} />
              <span>{post.author?.name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-primary-600 font-medium">
            Read More
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}