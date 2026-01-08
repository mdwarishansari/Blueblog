import Link from 'next/link'
import { ArrowRight, Sparkles, Layers } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'
import CategoryCard from '@/components/CategoryCard'
import { Button } from '@/components/ui/Button'
import { generateSEO } from '@/lib/seo'
import { getSiteSettings } from '@/lib/getSiteSettings'
export const dynamic = 'force-dynamic'

export const metadata = generateSEO({
  title: 'Home',
  description: 'A modern, SEO-optimized blogging platform',
  url: '/',
})

// const SITE_NAME =
//   process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'BlueBlog'

/* -------------------------------------
   Data
------------------------------------- */
async function getFeaturedPosts() {
  return prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
    },
    include: {
      author: true,
      bannerImage: true,
      categories: true,
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  })
}

async function getCategories() {
  return prisma.category.findMany({
    include: {
      image: true,
      _count: { select: { posts: true } },
    },
    orderBy: { name: 'asc' },
  })
}

/* -------------------------------------
   Page
------------------------------------- */
export default async function Home() {
  const [posts, categories, settings] = await Promise.all([
    getFeaturedPosts(),
    getCategories(),
    getSiteSettings(),
  ])

  const siteName = settings['site_name'] ?? 'BlueBlog'


  return (
    <div className="bg-gray-50">

      {/* =====================================================
         HERO — GRADIENT + CSS ANIMATION (SERVER SAFE)
         ===================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-500 py-28 text-white">

        {/* grid overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        {/* animated blur blobs */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-pink-400/30 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-indigo-400/30 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-purple-400/30 blur-3xl animate-blob animation-delay-4000" />

        <div className="container relative z-10 mx-auto px-4 text-center">

          {/* pill */}
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Modern blogging platform
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl">
  Welcome to{' '}
  <span className="text-white underline decoration-white/30 underline-offset-8">
    {siteName}
  </span>
</h1>


          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90">
            Write, publish, and grow your audience with a platform built for
            creators who care about quality and performance.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/blog">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                Read Blog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
         FEATURED POSTS
         ===================================================== */}
      <section className="container mx-auto py-24 px-4 bg-white">

        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Posts
          </h2>

          <Link href="/blog">
            <Button variant="ghost">
              View all
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* =====================================================
         CATEGORIES
         ===================================================== */}
      <section className="bg-gray-50 py-24">

        <div className="container mx-auto px-4">

          <div className="mb-14 text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-indigo-700">
              <Layers className="h-4 w-4" />
              Explore topics
            </div>

            <h2 className="text-3xl font-bold text-gray-900">
              Browse Categories
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
              />
            ))}
          </div>

        </div>
      </section>

    </div>
  )
}
