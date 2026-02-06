import Link from 'next/link'
import { ArrowRight, Sparkles, Layers, Zap, Shield, Globe, Palette, Users, TrendingUp, UserPlus } from 'lucide-react'
import { Suspense } from 'react'

import PostCard from '@/components/PostCard'
import CategoryCard from '@/components/CategoryCard'
import { Button } from '@/components/ui/Button'
import { generateSEO } from '@/lib/seo'

import SiteNameHero from '@/components/SiteNameHero'
import SiteNameSkeleton from '@/components/skeletons/SiteNameSkeleton'
import PostCardSkeleton from '@/components/skeletons/PostCardSkeleton'
import CategoryCardSkeleton from '@/components/skeletons/CategoryCardSkeleton'

import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = generateSEO({
  title: 'BlueBlog – Modern Tech Blogging Platform',
  description:
    'BlueBlog is a modern tech blogging platform featuring tutorials, guides, and insights for developers and engineers.',
  url: '/',
})


/* -------------------------------------
   DATA SECTIONS (SERVER COMPONENTS)
------------------------------------- */

async function FeaturedPostsSection() {
  const posts = await prisma.post.findMany({
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

  return (
    <>
      {posts.map((post, index) => (
        <div
          key={post.id}
          className={`animate-fade-in-up stagger-${index + 1}`}
        >
          <PostCard post={post} />
        </div>
      ))}
    </>
  )
}

async function CategoriesSection() {
  const categories = await prisma.category.findMany({
    include: {
      image: true,
      _count: { select: { posts: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <>
      {categories.map((category, index) => (
        <div
          key={category.id}
          className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
        >
          <CategoryCard category={category} />
        </div>
      ))}
    </>
  )
}

/* -------------------------------------
   WHY BLUEBLOG FEATURES
------------------------------------- */
const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on Next.js with edge-ready performance. Your content loads instantly.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with encrypted data and secure authentication.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Palette,
    title: 'Beautiful Design',
    description: 'Modern, responsive design that looks stunning on every device.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'SEO optimized to help your content reach audiences worldwide.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Join a growing community of writers and readers who love quality content.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Audience',
    description: 'Built-in tools to help you track, engage, and grow your readership.',
    gradient: 'from-indigo-500 to-violet-500',
  },
]

/* -------------------------------------
   PAGE
------------------------------------- */
export default function Home() {
  return (
    <div className="bg-gray-50">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-500 py-28 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        {/* Enhanced floating blobs */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-pink-400/30 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-indigo-400/30 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-purple-400/30 blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-2xl animate-float" />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur animate-fade-in-down">
            <Sparkles className="h-4 w-4" />
            Modern blogging platform
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl animate-fade-in-up">
            Welcome to{' '}
            <Suspense fallback={<SiteNameSkeleton />}>
              <SiteNameHero />
            </Suspense>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 animate-fade-in-up stagger-2">
            Write, publish, and grow your audience with a platform built for
            creators who care about quality and performance.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in-up stagger-3">
            <Link href="/blog" aria-label="Read all blog posts on BlueBlog">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 hover-glow">
                Read Blog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/register" aria-label="Create your account on BlueBlog">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= WHY BLUEBLOG ================= */}
      <section className="relative py-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-violet-100/50 blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-16 text-center animate-fade-in">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-100 to-violet-100 px-4 py-2 text-indigo-700">
              <Sparkles className="h-4 w-4" />
              Why choose us
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">BlueBlog</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to create, share, and grow your content in one powerful platform.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`
                  group
                  relative
                  rounded-2xl
                  bg-white
                  p-8
                  border border-gray-100
                  shadow-sm
                  ui-transition
                  hover:shadow-xl
                  hover:-translate-y-1
                  hover-glow
                  card-shine
                  animate-fade-in-up
                  stagger-${Math.min(index + 1, 6)}
                `}
              >
                {/* Icon */}
                <div className={`
                  mb-5
                  inline-flex
                  h-14 w-14
                  items-center justify-center
                  rounded-xl
                  bg-gradient-to-br ${feature.gradient}
                  text-white
                  shadow-lg
                  ui-transition
                  group-hover:scale-110
                  group-hover:shadow-xl
                `}>
                  <feature.icon className="h-7 w-7" />
                </div>

                {/* Content */}
                <h3 className="mb-3 text-xl font-semibold text-gray-900 group-hover:text-indigo-600 ui-transition">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative gradient line */}
                <div className={`
                  absolute bottom-0 left-0 right-0 h-1
                  bg-gradient-to-r ${feature.gradient}
                  rounded-b-2xl
                  opacity-0
                  ui-transition
                  group-hover:opacity-100
                `} />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center animate-fade-in">
            <Link href="/register">
              <Button size="lg" className="gap-2 hover-glow">
                <UserPlus className="h-5 w-5" />
                Start Writing Today
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FEATURED POSTS ================= */}
      <section className="container mx-auto py-24 px-4 bg-white">
        <div className="mb-12 flex items-center justify-between animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-900">Featured Posts</h2>
          <Link href="/blog" aria-label="View all published blog posts on BlueBlog">
            <Button variant="ghost">View all</Button>
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Suspense
            fallback={Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          >
            <FeaturedPostsSection />
          </Suspense>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center animate-fade-in">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-indigo-700">
              <Layers className="h-4 w-4" />
              Explore topics
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Browse Categories
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Suspense
              fallback={Array.from({ length: 4 }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            >
              <CategoriesSection />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 py-24">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-pink-400/20 blur-3xl animate-blob animation-delay-2000" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in-up">
            Ready to start your journey?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-fade-in-up stagger-2">
            Join thousands of writers who are already sharing their stories on BlueBlog.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-3">
            <Link href="/register">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 hover-glow gap-2">
                <UserPlus className="h-5 w-5" />
                Create Free Account
              </Button>
            </Link>
            <Link href="/blog">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Explore Blog
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
