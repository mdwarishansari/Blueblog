import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'
import { generateSEO } from '@/lib/seo'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { EmptyState } from '@/components/ui/EmptyState'

export const dynamic = 'force-dynamic'

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
    <div className="min-h-screen bg-canvas-cream relative overflow-hidden">
      
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-canvas-cream to-lavender-mist/40 py-20 border-b border-hairline">
        {/* Blurred category image backdrop */}
        {category.image?.url && (
          <div className="absolute inset-0 opacity-12 blur-3xl scale-110 pointer-events-none">
            <img src={category.image.url} className="h-full w-full object-cover" alt="" />
          </div>
        )}
        {/* Dynamic Background glows */}
        <div className="absolute top-10 left-[15%] w-[250px] h-[250px] bg-electric-cobalt/5 rounded-full blur-[80px] pointer-events-none animate-glow-pulse-1" />
        <div className="absolute bottom-5 right-[15%] w-[300px] h-[300px] bg-vivid-violet/5 rounded-full blur-[90px] pointer-events-none animate-glow-pulse-2" />

        <Container className="relative z-10 text-center">
          {category.image?.url && (
            <div className="mx-auto mb-6 h-24 w-24 rounded-[20px] overflow-hidden border border-hairline bg-pure-white flex items-center justify-center p-1.5 shadow-md hover:scale-105 active:scale-95 transition-all duration-300 opacity-0 animate-fade-up">
              <img src={category.image.url} className="h-full w-full object-cover rounded-[14px]" alt={category.name} />
            </div>
          )}

          <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-pure-white border border-hairline px-3.5 py-1 text-xs font-semibold text-vivid-violet shadow-sm opacity-0 animate-fade-up delay-100">
            Category
          </div>

          <h1 className="mb-4 text-3xl sm:text-[48px] font-bold tracking-tight text-ink-charcoal leading-tight opacity-0 animate-fade-up delay-200">
            {category.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-gray opacity-0 animate-fade-up delay-300">
            {category._count.posts} {category._count.posts === 1 ? 'article' : 'articles'} published
          </p>
        </Container>
      </section>

      {/* ================= POSTS ================= */}
      <Section className="py-12">
        <Container>
          {category.posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {category.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={`No posts in ${category.name}`}
              description="Articles will appear here once they are published by our team."
            />
          )}
        </Container>
      </Section>
    </div>
  )
}
