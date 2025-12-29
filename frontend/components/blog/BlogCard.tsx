'use client'

import Link from 'next/link'
import { FiCalendar, FiUser, FiArrowRight } from 'react-icons/fi'
import { formatDate } from '@/lib/utils/formatDate'

const FALLBACK_IMAGE = '/placeholder-blog.png'

export default function BlogCard({ post }: { post: any }) {
  const imageUrl = post.banner_image?.url || FALLBACK_IMAGE

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex flex-col overflow-hidden transition bg-white border shadow-sm group rounded-xl hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100 aspect-video">
        <img
          src={imageUrl}
          alt={post.banner_image?.alt_text || post.title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category badge */}
        {post.categories?.[0] && (
          <span className="absolute px-3 py-1 text-xs font-medium text-gray-800 rounded-full top-3 left-3 bg-white/90">
            {post.categories[0].name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="mb-3 text-lg font-bold text-gray-900 transition-colors line-clamp-2 group-hover:text-primary-600">
          {post.title}
        </h3>

        <p className="mb-6 text-sm text-gray-600 line-clamp-3">
          {post.excerpt || 'Read the full article to learn more.'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FiCalendar size={14} />
              {post.published_at ? formatDate(post.published_at) : '—'}
            </span>

            <span className="flex items-center gap-1">
              <FiUser size={14} />
              {post.author?.name || 'Admin'}
            </span>
          </div>

          <span className="flex items-center gap-1 font-medium text-primary-600">
            Read more
            <FiArrowRight className="transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}
