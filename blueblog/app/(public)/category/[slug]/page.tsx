import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'
import { generateSEO } from '@/lib/seo'

/* ---------------- DATA ---------------- */
async function getCategory(slug: string) {
  return prisma.category.findUnique({
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

/* ---------------- SEO ---------------- */
export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params

  const category = await getCategory(slug)
  if (!category) return generateSEO()

  const image = category.image?.url

return generateSEO({
  title: category.name,
  description: `Browse posts in ${category.name}`,
  url: `/category/${category.slug}`,
  ...(image ? { image } : {}),
})
}

/* ---------------- PAGE ---------------- */
export default async function CategoryPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params

  const category = await getCategory(slug)
  if (!category) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="relative">
        {category.image?.url ? (
          <div className="absolute inset-0">
            <Image
              src={category.image.url}
              alt={category.image.altText || category.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400" />
        )}

        <div className="relative py-20 text-center text-white">
          <h1 className="text-4xl font-bold">{category.name}</h1>
          <p className="mt-2 opacity-90">
            {category._count.posts} published posts
          </p>
        </div>
      </section>

      {/* POSTS */}
      <section className="container mx-auto px-4 py-14">
        {category.posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {category.posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-white p-12 text-center">
            <h3 className="text-xl font-semibold">
              No posts in {category.name}
            </h3>
            <p className="mt-2 text-gray-600">
              Posts will appear here once published.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
