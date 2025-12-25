'use client'

import Link from 'next/link'
import { FiFolder } from 'react-icons/fi'

interface Category {
  id: string
  name: string
  slug: string
  post_count?: number
}

interface CategoryListProps {
  categories: Category[] | null | undefined
}

export default function CategoryList({ categories }: CategoryListProps) {
  // Handle null/undefined or non-array categories
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return null
  }

  // Take only first 6 categories
  const displayCategories = categories.slice(0, 6)

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse Categories</h2>
        <p className="text-gray-600">Explore articles by topic</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {displayCategories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-primary-500 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <FiFolder size={24} className="text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
              {category.name}
            </h3>
            {category.post_count !== undefined && (
              <p className="text-sm text-gray-500 mt-1">{category.post_count} articles</p>
            )}
          </Link>
        ))}
      </div>
      
      {categories.length > 6 && (
        <div className="text-center mt-8">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            View All Categories
            <span>→</span>
          </Link>
        </div>
      )}
    </section>
  )
}