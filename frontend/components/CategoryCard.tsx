import Link from 'next/link'
import Image from 'next/image'
import { Folder, ChevronRight, Hash } from 'lucide-react'
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
        rounded-2xl bg-card
        elev-sm ui-transition
        hover:-translate-y-1 hover:elev-lg
      "
    >
      {/* top accent */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />

      {/* Media */}
      {imageUrl ? (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={category.image?.altText || category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />
        </div>
      ) : (
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500">
          <div className="absolute inset-0 flex items-center justify-center">
            <Folder className="h-16 w-16 text-white/60" />
          </div>
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* Content */}
      <div className="relative flex flex-1 flex-col p-6">

        {/* Meta pill */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            <Hash className="h-3 w-3" />
            Category
          </div>
        </div>

        {/* Title */}
        <h3 itemProp="name" className="mb-2 text-xl font-bold text-fg">
  {category.name}
</h3>

        {/* Count */}
        <p className="mb-6 text-sm text-slate-600">
          {category._count.posts}{' '}
          {category._count.posts === 1 ? 'article' : 'articles'}
        </p>

        {/* CTA */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-200/60">
          <span className="text-sm font-medium text-indigo-600 ui-transition group-hover:text-pink-600">
            Browse category
          </span>
          <ChevronRight className="h-5 w-5 text-indigo-600 transition-transform group-hover:translate-x-1 group-hover:text-pink-600" />
        </div>
      </div>
    </Link>
    </article>
  )
}
