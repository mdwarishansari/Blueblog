import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Tag } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Post, User as UserType, Category, Image as ImageType } from '@prisma/client'
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
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
      {imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={post.bannerImage?.altText || post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {post.categories.slice(0, 2).map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors"
            >
              <Tag className="mr-1 h-3 w-3" />
              {category.name}
            </Link>
          ))}
        </div>
        
        <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
          <Link href={`/blog/${post.slug}`} className="before:absolute before:inset-0">
            {post.title}
          </Link>
        </h3>
        
        {post.excerpt && (
          <p className="mb-4 flex-1 text-gray-600 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        
        <div className="mt-auto flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="font-medium">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.publishedAt?.toISOString()}>
                {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
              </time>
            </div>
          </div>
          
          <Link
            href={`/blog/${post.slug}`}
            className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  )
}