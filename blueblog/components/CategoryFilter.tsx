'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Category } from '@prisma/client'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: (Category & { _count: { posts: number } })[]
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')

  return (
    <div className="space-y-2">
      <Link
        href="/blog"
        className={cn(
          'block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
          !currentCategory
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        )}
      >
        All Posts
        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {categories.reduce((acc, cat) => acc + cat._count.posts, 0)}
        </span>
      </Link>
      
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/blog?category=${category.slug}`}
          className={cn(
            'block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
            currentCategory === category.slug
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          {category.name}
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {category._count.posts}
          </span>
        </Link>
      ))}
    </div>
  )
}