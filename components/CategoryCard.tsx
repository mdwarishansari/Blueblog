import Link from 'next/link'
import Image from 'next/image'
import { Folder, ChevronRight } from 'lucide-react'
import { Category, Image as ImageType } from '@prisma/client'
import { getOptimizedImageUrl } from '@/lib/cloudinary.utils'

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
    <article
      itemScope
      itemType="https://schema.org/CollectionPage"
    >
      <Link
        href={`/category/${category.slug}`}
        className="
          group relative flex h-full flex-col overflow-hidden
          rounded-[16px] bg-pure-white border border-hairline
          shadow-subtle hover:shadow-lg transition-all duration-300
        "
      >
        {/* Media */}
        {imageUrl ? (
          <div className="relative h-48 w-full overflow-hidden rounded-t-[16px]">
            <Image
              src={imageUrl}
              alt={category.image?.altText || category.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-103"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>
        ) : (
          <div className="relative h-48 w-full overflow-hidden bg-lavender-mist rounded-t-[16px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <Folder className="h-16 w-16 text-vivid-violet/50" />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="relative flex flex-1 flex-col p-6">

          {/* Meta pill */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-1.5 rounded-[8px] bg-lavender-mist px-2.5 py-0.5 text-xs font-medium text-vivid-violet">
              Category
            </div>
          </div>

          {/* Title */}
          <h3 itemProp="name" className="mb-2 text-lg font-bold text-ink-charcoal">
            {category.name}
          </h3>

          {/* Count */}
          <p className="mb-6 text-sm text-slate-gray">
            {category._count.posts}{' '}
            {category._count.posts === 1 ? 'article' : 'articles'}
          </p>

          {/* CTA */}
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-hairline">
            <span className="text-sm font-semibold text-electric-cobalt transition-colors duration-150">
              Browse category
            </span>
            <ChevronRight className="h-4 w-4 text-electric-cobalt transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </article>
  )
}
