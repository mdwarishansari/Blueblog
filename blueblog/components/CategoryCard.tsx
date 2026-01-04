import Link from 'next/link'
import Image from 'next/image'
import { Folder, ChevronRight } from 'lucide-react'
import { Category, Image as ImageType } from '@prisma/client'
import { getOptimizedImageUrl } from '@/lib/cloudinary'

interface CategoryCardProps {
  category: Category & {
    image?: ImageType | null
    _count: { posts: number }
  }
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const imageUrl = category.image?.url
    ? getOptimizedImageUrl(category.image.url, 400, 250)
    : null

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
    >
      {/* Background Image */}
      {imageUrl ? (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={category.image?.altText || category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </div>
      ) : (
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary-600 to-primary-400">
          <div className="absolute inset-0 flex items-center justify-center">
            <Folder className="h-16 w-16 text-white/50" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative flex flex-1 flex-col p-6">
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
            <Folder className="h-4 w-4" />
            <span className="text-sm font-medium text-white">Category</span>
          </div>
        </div>

        <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-primary-600">
          {category.name}
        </h3>

        <p className="mb-4 text-gray-600">
          {category._count.posts} {category._count.posts === 1 ? 'article' : 'articles'}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700">
            Browse category
          </span>
          <ChevronRight className="h-5 w-5 text-primary-600 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}