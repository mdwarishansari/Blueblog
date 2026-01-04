import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'
import { generateSEO } from '@/lib/seo'
import { getOptimizedImageUrl } from '@/lib/cloudinary'

async function getCategory(slug: string) {
  return await prisma.category.findUnique({
    where: { slug },
    include: {
      image: true,
      posts: {
        where: {
          status: 'PUBLISHED',
          publishedAt: { lte: new Date() },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          bannerImage: true,
          categories: true,
        },
        orderBy: { publishedAt: 'desc' },
      },
      _count: {
        select: {
          posts: {
            where: {
              status: 'PUBLISHED',
              publishedAt: { lte: new Date() },
            },
          },
        },
      },
    },
  })
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategory(params.slug)
  
  if (!category) {
    return generateSEO()
  }

  const imageUrl = category.image?.url
    ? getOptimizedImageUrl(category.image.url, 1200, 630)
    : undefined

  return generateSEO({
    title: category.name,
    description: `Browse all posts in ${category.name}`,
    image: imageUrl,
    url: `/category/${category.slug}`,
  })
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  })
  
  return categories.map((category) => ({
    slug: category.slug,
  }))
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug)
  
  if (!category) {
    notFound()
  }

  const imageUrl = category.image?.url
    ? getOptimizedImageUrl(category.image.url, 1200, 400)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {imageUrl && (
          <div className="absolute inset-0">
            <Image
              src={imageUrl}
              alt={category.image?.altText || category.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}
        {!imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400" />
        )}
        
        <div className="relative py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center text-white">
              <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
                {category.name}
              </h1>
              <p className="text-xl opacity-90">
                {category._count.posts} articles in this category
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {category.posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {category.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
              <div className="mx-auto max-w-md">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  No posts yet in {category.name}
                </h3>
                <p className="text-gray-600">
                  Check back soon for articles in this category.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}