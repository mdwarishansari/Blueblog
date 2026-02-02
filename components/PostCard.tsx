import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Tag, ArrowRight } from 'lucide-react'
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
    ? getOptimizedImageUrl(post.bannerImage.url, 400, 250)
    : null

  return (
    <article
  itemScope
  itemType="https://schema.org/BlogPosting"
  className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card elev-sm ui-transition hover:-translate-y-1 hover:elev-lg"
>

      {/* top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />

      {/* Image */}
      {imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={post.bannerImage?.altText || post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
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
                inline-flex items-center gap-1.5
                rounded-full px-3 py-1
                text-xs font-medium
                bg-indigo-50 text-indigo-700
                hover:bg-indigo-100
                ui-transition
              "
            >
              <Tag className="h-3 w-3" />
              {category.name}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h3 className="mb-3 text-xl font-bold leading-snug text-fg">
          <Link
            href={`/blog/${post.slug}`}
            className="
              relative
              bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600
              bg-[length:0%_2px]
              bg-left-bottom
              bg-no-repeat
              transition-[background-size]
              duration-300
              hover:bg-[length:100%_2px]
            "
          >
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-auto flex items-center justify-between text-sm text-slate-500">

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span itemProp="author">{post.author.name}</span>
              <span className="font-medium">{post.author.name}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
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
              font-medium text-indigo-600
              ui-transition
              hover:text-pink-600
            "
          >
            Read
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  )
}
