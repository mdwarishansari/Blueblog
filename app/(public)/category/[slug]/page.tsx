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
  title: `${category.name} Articles – BlueBlog`,
  description: `Browse all published articles in the ${category.name} category on BlueBlog.`,
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
    <div className="min-h-screen bg-bg">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        {category.image?.url ? (
          <div className="absolute inset-0">
            <Image
              src={category.image.url}
              alt={category.image.altText || category.name}
              fill
              className="object-cover"
              priority
            />
            {/* overlay for readability */}
            <div className="absolute inset-0 bg-black/55" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500" />
        )}

        <div className="relative py-24 text-center text-white">
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {category.name}
          </h1>
          <p className="text-lg text-white/90">
            {category._count.posts} published posts
          </p>
        </div>
      </section>

      {/* ================= POSTS ================= */}
      <section className="py-20">
        <div className="container">

          {category.posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {category.posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-14 text-center">
              <h3 className="mb-2 text-xl font-semibold text-fg">
                No posts in {category.name}
              </h3>
              <p className="text-slate-600">
                Posts will appear here once published.
              </p>
            </div>
          )}

        </div>
      </section>
    </div>
  )
}
