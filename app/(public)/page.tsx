import Link from 'next/link'
import { ArrowRight, Sparkles, Layers, Zap, Shield, Globe, Palette, Users, TrendingUp } from 'lucide-react'
import { Suspense } from 'react'

import PostCard from '@/components/PostCard'
import CategoryCard from '@/components/CategoryCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
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

  if (posts.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-slate-gray">
        No featured articles found. Check back later!
      </div>
    )
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
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
    take: 8,
  })

  if (categories.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-slate-gray">
        No categories found.
      </div>
    )
  }

  return (
    <>
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
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
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with encrypted data and secure authentication.',
  },
  {
    icon: Palette,
    title: 'Beautiful Design',
    description: 'Modern, responsive design that looks stunning on every device.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'SEO optimized to help your content reach audiences worldwide.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Join a growing community of writers and readers who love quality content.',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Audience',
    description: 'Built-in tools to help you track, engage, and grow your readership.',
  },
]

/* -------------------------------------
   PAGE
------------------------------------- */
export default function Home() {
  return (
    <div className="min-h-screen bg-canvas-cream">
      
      {/* ================= HERO ================= */}
      <section className="relative pt-20 pb-28 overflow-hidden bg-gradient-to-b from-canvas-cream via-canvas-cream to-lavender-mist">
        <Container className="relative z-10 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-pure-white border border-hairline px-4 py-1.5 text-xs font-semibold text-vivid-violet shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Modern blogging platform
          </div>

          <h1 className="mb-6 text-[40px] sm:text-[57px] md:text-[84px] font-bold tracking-tight text-ink-charcoal leading-[1.06] max-w-[960px] mx-auto">
            Welcome to{' '}
            <Suspense fallback={<SiteNameSkeleton />}>
              <SiteNameHero />
            </Suspense>
          </h1>

          <p className="mx-auto mb-10 max-w-[640px] text-lg sm:text-xl text-slate-gray leading-relaxed font-normal">
            Write, publish, and grow your audience with a platform built for creators who care about quality and performance.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/blog" aria-label="Read all blog posts on BlueBlog">
              <Button variant="default" size="lg">
                Read Blog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/register" aria-label="Create your account on BlueBlog">
              <Button
                variant="secondary"
                size="lg"
                className="bg-pure-white border-hairline shadow-sm"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ================= WHY BLUEBLOG ================= */}
      <Section>
        <Container>
          <div className="mb-16 text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-lavender-mist px-3.5 py-1 text-xs font-medium text-vivid-violet">
              Why choose us
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink-charcoal mb-4">
              Why BlueBlog?
            </h2>
            <p className="text-base sm:text-lg text-slate-gray max-w-xl mx-auto">
              Everything you need to create, share, and grow your content in one powerful platform.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                variant="white"
                className="flex flex-col p-8 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Icon */}
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-lavender-mist text-vivid-violet">
                  <feature.icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <h3 className="mb-3 text-lg font-bold text-ink-charcoal">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-gray leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ================= FEATURED POSTS ================= */}
      <Section className="py-16 bg-pure-white border-y border-hairline">
        <Container>
          <div className="mb-12 flex items-end justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-lavender-mist px-3.5 py-1 text-xs font-medium text-vivid-violet">
                Curated articles
              </div>
              <h2 className="text-3xl font-bold text-ink-charcoal tracking-tight">Featured Posts</h2>
            </div>
            <Link href="/blog" aria-label="View all published blog posts on BlueBlog">
              <Button variant="ghost" className="rounded-full text-sm font-semibold">
                View all
              </Button>
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
        </Container>
      </Section>

      {/* ================= CATEGORIES ================= */}
      <Section>
        <Container>
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-lavender-mist px-3.5 py-1 text-xs font-medium text-vivid-violet">
              <Layers className="h-3.5 w-3.5" />
              Explore topics
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-ink-charcoal mb-4">
              Browse Categories
            </h2>
            <p className="text-sm text-slate-gray max-w-md mx-auto">
              Find articles on design, web development, coding languages, databases, and more.
            </p>
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
        </Container>
      </Section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-canvas-cream via-powder-blue to-electric-cobalt py-24 border-t border-hairline">
        <Container className="relative z-10 text-center">
          <h2 className="text-3xl sm:text-[48px] font-bold text-ink-charcoal tracking-tight mb-6 leading-[1.2]">
            Ready to start your journey?
          </h2>
          <p className="text-base sm:text-lg text-ink-charcoal/85 mb-10 max-w-xl mx-auto font-normal">
            Join thousands of writers who are already sharing their stories on BlueBlog.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" variant="default" className="rounded-full shadow-md">
                Create Free Account
              </Button>
            </Link>
            <Link href="/blog">
              <Button size="lg" variant="secondary" className="bg-pure-white border-hairline shadow-sm rounded-full">
                Explore Blog
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  )
}
