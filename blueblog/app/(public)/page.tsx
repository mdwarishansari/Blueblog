import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'
import CategoryCard from '@/components/CategoryCard'
import { Button } from '@/components/ui/Button'
import { generateSEO } from '@/lib/seo'

export const metadata = generateSEO({
  title: 'Home',
  description: 'A modern, SEO-optimized blogging platform',
  url: '/',
})

const SITE_NAME =
  process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'BlueBlog'


async function getFeaturedPosts() {
  return prisma.post.findMany({
    where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
    include: { author: true, bannerImage: true, categories: true },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  })
}

async function getCategories() {
  return prisma.category.findMany({
    include: { image: true, _count: { select: { posts: true } } },
    orderBy: { name: 'asc' },
  })
}

export default async function Home() {
  const [posts, categories] = await Promise.all([
    getFeaturedPosts(),
    getCategories(),
  ])

  return (
    <>
      {/* HERO */}
<section className="py-24 bg-gradient-to-br from-primary-600 to-primary-400 dark:from-primary-700 dark:to-primary-500">
  <div className="container mx-auto px-4 text-center">
    <h1 className="mb-6 text-5xl font-bold text-foreground">
      Welcome to {SITE_NAME}
    </h1>

    <p className="mx-auto mb-8 max-w-2xl text-lg text-foreground/80">
      A modern, SEO-optimized blogging platform
    </p>

    <Link href="/blog">
      <Button size="lg" variant="secondary">
        Read Blog <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Link>
  </div>
</section>



      {/* POSTS */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Posts</h2>
          <Link href="/blog">
            <Button variant="ghost">View all</Button>
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {posts.map(p => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">
            Browse Categories
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(c => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
