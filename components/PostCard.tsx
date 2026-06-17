import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import {
  Post,
  User as UserType,
  Category,
  Image as ImageType,
} from '@prisma/client'
import { getOptimizedImageUrl } from '@/lib/cloudinary.utils'

interface PostCardProps {
  post: Post & {
    author: Pick<UserType, 'id' | 'name' | 'profileImage'>
    bannerImage: ImageType | null
    categories: Category[]
  }
}

export default function PostCard({ post }: PostCardProps) {
  const imageUrl = post.bannerImage?.url
    ? getOptimizedImageUrl(post.bannerImage.url, 600)
    : null

  return (
    <article
      itemScope
      itemType="https://schema.org/BlogPosting"
      className="group relative flex h-full flex-col overflow-hidden rounded-[16px] bg-pure-white border border-hairline shadow-subtle hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      {imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-t-[16px]">
          <Image
            src={imageUrl}
            alt={post.bannerImage?.altText || post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-103"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">

        {/* Categories */}
        <div className="mb-4 flex flex-wrap gap-2">
          {post.categories.slice(0, 2).map(category => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="
                inline-flex items-center
                rounded-[8px] px-2.5 py-0.5
                text-xs font-medium
                bg-lavender-mist text-vivid-violet
                hover:opacity-90
                transition-opacity duration-150
              "
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h3 className="mb-3 text-lg font-bold leading-snug text-ink-charcoal">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-electric-cobalt transition-colors duration-150"
          >
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-gray line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-auto flex items-center justify-between text-xs text-slate-gray">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span itemProp="author" className="font-medium">{post.author.name}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <time
                itemProp="datePublished"
                dateTime={post.publishedAt?.toISOString()}>
                {post.publishedAt
                  ? formatDate(post.publishedAt)
                  : 'Draft'}
              </time>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/blog/${post.slug}`}
            className="
              inline-flex items-center gap-1
              font-semibold text-electric-cobalt
              hover:text-deep-cobalt
              transition-colors duration-150
            "
          >
            Read
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
