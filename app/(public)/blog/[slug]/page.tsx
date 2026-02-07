import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, Tag, ArrowLeft, Clock, Share2, BookOpen } from 'lucide-react'

import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { renderTipTapContent } from '@/lib/renderContent'
import PostCard from '@/components/PostCard'

/* ---------------- DATA ---------------- */
async function getPost(slug: string) {
  return prisma.post.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
    },
    include: {
      author: true,
      bannerImage: true,
      categories: true,
    },
  })
}

async function getRelatedPosts(postId: string, categoryIds: string[]) {
  return prisma.post.findMany({
    where: {
      id: { not: postId },
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
      categories: {
        some: { id: { in: categoryIds } },
      },
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

/* ---------------- HELPERS ---------------- */
function calculateReadingTime(content: any): number {
  if (!content) return 1
  const text = JSON.stringify(content)
  const wordCount = text.split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

/* ---------------- SEO (APP ROUTER WAY) ---------------- */
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await prisma.post.findFirst({
    where: {
      slug: params.slug,
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
    },
    include: {
      bannerImage: true,
    },
  })

  if (!post) {
    return {
      title: 'Post not found',
    }
  }

  const title = post.seoTitle || post.title
  const description =
    post.seoDescription || post.excerpt || 'Read this article on BlueBlog'

  const image = post.bannerImage?.url
  const url = `${process.env['NEXT_PUBLIC_SITE_URL']}/blog/${post.slug}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

/* ---------------- PAGE ---------------- */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const post = await getPost(slug)
  if (!post) notFound()

  const relatedPosts = await getRelatedPosts(
    post.id,
    post.categories.map(c => c.id)
  )

  const html = renderTipTapContent(post.content)
  const readingTime = calculateReadingTime(post.content)

  return (
    <main className="relative min-h-screen bg-bg overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-200/40 via-violet-200/30 to-pink-200/20 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-gradient-to-tr from-pink-200/30 via-violet-200/20 to-indigo-200/30 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-40 right-1/4 h-72 w-72 rounded-full bg-gradient-to-tl from-violet-200/30 via-indigo-200/20 to-pink-200/20 blur-3xl animate-blob animation-delay-4000" />
      </div>

      <article
        className="relative mx-auto max-w-5xl px-6 py-14"
        itemScope
        itemType="https://schema.org/BlogPosting"
      >
        {/* Hero Banner with Gradient Overlay */}
        {post.bannerImage?.url && (
          <div className="relative mb-10 aspect-video overflow-hidden rounded-3xl elev-md animate-scale-in group">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 p-[3px]">
              <div className="h-full w-full rounded-3xl overflow-hidden bg-bg">
                <Image
                  src={post.bannerImage.url}
                  alt={post.bannerImage.altText || post.title}
                  width={1280}
                  height={720}
                  className="h-full w-full object-cover ui-transition group-hover:scale-105"
                  priority
                />
              </div>
            </div>
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-3xl pointer-events-none" />
          </div>
        )}

        {/* Categories Pills */}
        <div className="mb-5 flex flex-wrap gap-2 animate-fade-in-up stagger-1">
          {post.categories.map(cat => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="
                inline-flex items-center gap-1.5
                rounded-full px-4 py-1.5
                text-sm font-semibold
                bg-gradient-to-r from-indigo-50 to-violet-50
                text-indigo-700 border border-indigo-100
                ui-transition hover:shadow-lg hover:scale-105
                hover:from-indigo-100 hover:to-violet-100
              "
            >
              <Tag className="h-3.5 w-3.5" />
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Title with Gradient Text */}
        <h1
          className="mb-6 text-4xl md:text-5xl font-extrabold leading-tight tracking-tight animate-fade-in-up stagger-2"
          itemProp="headline"
        >
          <span className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 bg-clip-text text-transparent">
            {post.title}
          </span>
        </h1>

        {/* Meta Info Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-4 md:gap-6 animate-fade-in-up stagger-3">
          {/* Author */}
          <div
            className="flex items-center gap-2.5 glass-card px-4 py-2 rounded-full"
            itemProp="author"
            itemScope
            itemType="https://schema.org/Person"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-md">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium text-fg" itemProp="name">{post.author.name}</span>
          </div>

          {/* Date */}
          {post.publishedAt && (
            <time
              className="flex items-center gap-2 text-slate-600 glass-card px-4 py-2 rounded-full"
              dateTime={post.publishedAt.toISOString()}
              itemProp="datePublished"
            >
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span className="font-medium">{formatDate(post.publishedAt)}</span>
            </time>
          )}

          {/* Reading Time */}
          <div className="flex items-center gap-2 text-slate-600 glass-card px-4 py-2 rounded-full">
            <Clock className="h-4 w-4 text-violet-500" />
            <span className="font-medium">{readingTime} min read</span>
          </div>
        </div>

        {/* Excerpt Callout */}
        {post.excerpt && (
          <div className="mb-10 animate-fade-in-up stagger-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-50 via-violet-50 to-pink-50 p-6 md:p-8 border border-indigo-100/50 elev-sm">
              {/* Decorative icon */}
              <div className="absolute top-4 right-4 h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-indigo-600/60" />
              </div>
              {/* Quote accent */}
              <div className="absolute -top-2 -left-2 text-6xl font-serif text-indigo-200/50">"</div>
              <p className="relative text-lg md:text-xl leading-relaxed text-slate-700 italic font-medium">
                {post.excerpt}
              </p>
            </div>
          </div>
        )}

        {/* Article Content */}
        <section className="relative animate-fade-in-up stagger-5">
          {/* Gradient accent line */}
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-indigo-500 via-violet-500 to-pink-500 hidden md:block" />

          <div className="rounded-3xl bg-card p-8 md:p-12 elev-md hover-glow ui-transition">
            {/* Content prose area */}
            <div
              className="
                prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-fg
                prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
                prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6 prose-h2:text-indigo-900
                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-5 prose-h3:text-violet-900
                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-indigo-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:text-pink-600
                prose-strong:text-fg prose-strong:font-bold
                prose-em:text-slate-600 prose-em:italic
                prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                prose-li:text-slate-700 prose-li:mb-2
                prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600 prose-blockquote:bg-indigo-50/50 prose-blockquote:py-4 prose-blockquote:rounded-r-lg
                prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-pink-600 prose-code:font-mono prose-code:text-sm
                prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-6 prose-pre:overflow-x-auto
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
                prose-hr:border-slate-200 prose-hr:my-8
              "
              itemProp="articleBody"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </section>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 animate-fade-in">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-fg">
                Related Articles
              </h2>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-indigo-500/30 via-violet-500/20 to-transparent rounded-full" />
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {relatedPosts.map((relPost, index) => (
                <div
                  key={relPost.id}
                  className={`animate-fade-in-up stagger-${index + 1}`}
                >
                  <PostCard post={relPost} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back to Blog */}
        <div className="mt-20 text-center animate-fade-in">
          <Link href="/blog" aria-label="Back to BlueBlog blog listing">
            <Button variant="outline" className="gap-2 px-8 py-3 hover-glow group">
              <ArrowLeft className="h-4 w-4 ui-transition group-hover:-translate-x-1" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </article>
    </main>
  )
}
