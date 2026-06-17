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
import AnimatedCounter from '@/components/AnimatedCounter'
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
export default async function Home() {
  // Fetch real project metrics directly from Neon PostgreSQL database
  const [postCount, categoryCount, authorCount] = await Promise.all([
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.category.count(),
    prisma.user.count(),
  ])

  return (
    <div className="min-h-screen bg-canvas-cream relative overflow-x-hidden">
      {/* Dynamic Background Gradients and Floating Decorative Elements */}
      <div className="absolute top-12 left-[10%] w-[320px] h-[320px] bg-electric-cobalt/10 rounded-full blur-[120px] pointer-events-none animate-glow-pulse-1" />
      <div className="absolute top-40 right-[8%] w-[420px] h-[420px] bg-vivid-violet/10 rounded-full blur-[140px] pointer-events-none animate-glow-pulse-2" />
      
      {/* ================= HERO ================= */}
      <section className="relative pt-24 pb-28 overflow-hidden">
        <Container className="relative z-10 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-pure-white border border-hairline px-4 py-1.5 text-xs font-semibold text-vivid-violet shadow-sm hover:scale-102 active:scale-98 transition-all duration-200 opacity-0 animate-fade-up">
            <Sparkles className="h-3.5 w-3.5 text-electric-cobalt animate-pulse" />
            <span>Modern SaaS-quality blog platform</span>
          </div>

          <h1 className="mb-6 text-[44px] sm:text-[64px] md:text-[88px] font-extrabold tracking-tight text-ink-charcoal leading-[1.04] max-w-[960px] mx-auto bg-clip-text opacity-0 animate-fade-up delay-100">
            Welcome to{' '}
            <Suspense fallback={<SiteNameSkeleton />}>
              <SiteNameHero />
            </Suspense>
          </h1>

          <p className="mx-auto mb-10 max-w-[660px] text-lg sm:text-xl text-slate-gray leading-relaxed font-normal opacity-0 animate-fade-up delay-200">
            Write, publish, and grow your audience with an engineering-focused platform built for creators who care about code, speed, and clean typography.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16 opacity-0 animate-fade-up delay-300">
            <Link href="/blog" aria-label="Read all blog posts on BlueBlog">
              <Button
                variant="default"
                size="lg"
                className="rounded-full shadow-lg shadow-electric-cobalt/20 bg-gradient-to-r from-electric-cobalt to-vivid-violet hover:from-deep-cobalt hover:to-vivid-violet text-pure-white border-0 hover:scale-105 active:scale-95 transition-all duration-200 px-12 h-14 text-lg font-bold min-w-[220px] justify-center inline-flex items-center"
              >
                Read Blog
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/register" aria-label="Create your account on BlueBlog">
              <Button
                variant="secondary"
                size="lg"
                className="bg-pure-white/80 backdrop-blur-sm border-hairline shadow-sm rounded-full hover:scale-105 active:scale-95 hover:border-vivid-violet/30 hover:text-vivid-violet transition-all duration-200 px-12 h-14 text-lg font-bold min-w-[220px] justify-center inline-flex items-center"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Real Metrics Glassmorphic Spotlight Card */}
          <div className="mx-auto max-w-3xl grid grid-cols-3 gap-4 rounded-[24px] bg-pure-white/45 backdrop-blur-md border border-hairline p-6 sm:p-8 shadow-subtle hover:shadow-md transition-all duration-300 animate-float opacity-0 animate-fade-up delay-500">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-electric-cobalt">
                <AnimatedCounter value={postCount} />
              </p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-gray uppercase tracking-wider mt-1">Articles</p>
            </div>
            <div className="text-center border-x border-hairline">
              <p className="text-3xl sm:text-4xl font-extrabold text-vivid-violet">
                <AnimatedCounter value={categoryCount} />
              </p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-gray uppercase tracking-wider mt-1">Topics</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-ink-charcoal">
                <AnimatedCounter value={authorCount} />
              </p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-gray uppercase tracking-wider mt-1">Writers</p>
            </div>
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
      <section className="relative overflow-hidden bg-gradient-to-br from-canvas-cream via-powder-blue/40 to-electric-cobalt/35 py-24 pb-16 border-t border-hairline">
        {/* Glow effect */}
        <div className="absolute bottom-0 left-[20%] w-[400px] h-[250px] bg-electric-cobalt/10 rounded-full blur-[100px] pointer-events-none animate-glow-pulse-1" />
        <Container className="relative z-10 text-center">
          <h2 className="text-3xl sm:text-[48px] font-bold text-ink-charcoal tracking-tight mb-6 leading-[1.2] opacity-0 animate-fade-up">
            Ready to start your journey?
          </h2>
          <p className="text-base sm:text-lg text-ink-charcoal/85 mb-10 max-w-xl mx-auto font-normal opacity-0 animate-fade-up delay-100">
            Join thousands of writers who are already sharing their stories on BlueBlog.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center opacity-0 animate-fade-up delay-200">
            <Link href="/register">
              <Button
                size="lg"
                variant="default"
                className="rounded-full shadow-lg shadow-electric-cobalt/20 bg-gradient-to-r from-electric-cobalt to-vivid-violet hover:from-deep-cobalt hover:to-vivid-violet border-0 hover:scale-105 active:scale-95 transition-all duration-200 px-8"
              >
                Create Free Account
              </Button>
            </Link>
            <Link href="/blog">
              <Button
                size="lg"
                variant="secondary"
                className="bg-pure-white border-hairline shadow-sm rounded-full hover:scale-105 active:scale-95 hover:border-vivid-violet/30 hover:text-vivid-violet transition-all duration-200 px-8"
              >
                Explore Blog
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  )
}
