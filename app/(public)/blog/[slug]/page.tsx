import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { User, ArrowLeft } from 'lucide-react'

import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { renderTipTapContent } from '@/lib/renderContent'
import PostCard from '@/components/PostCard'
import ReadingProgressBar from '@/components/blog/ReadingProgressBar'
import TableOfContents from '@/components/blog/TableOfContents'

interface Heading {
  id: string
  text: string
  level: number
}

/* ---------------- HELPERS ---------------- */
function calculateReadingTime(content: any): number {
  if (!content) return 1
  const text = JSON.stringify(content)
  const wordCount = text.split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

function extractHeadings(html: string): { modifiedHtml: string; headings: Heading[] } {
  const headings: Heading[] = []
  let headingIndex = 0
  
  const modifiedHtml = html.replace(/<h([2-3])([^>]*)>(.*?)<\/h\1>/g, (_, levelStr, attrs, text) => {
    const level = parseInt(levelStr, 10)
    const cleanText = text.replace(/<[^>]*>/g, '').trim()
    const id = `heading-${headingIndex++}`
    headings.push({ id, text: cleanText, level })
    return `<h${level} id="${id}"${attrs}>${text}</h${level}>`
  })
  
  return { modifiedHtml, headings }
}

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

  const rawHtml = renderTipTapContent(post.content)
  const { modifiedHtml: html, headings } = extractHeadings(rawHtml)
  const readingTime = calculateReadingTime(post.content)

  return (
    <main className="relative min-h-screen bg-canvas-cream pb-20">
      <ReadingProgressBar />

      <article className="mx-auto max-w-[1200px] px-4 md:px-6 py-12" itemScope itemType="https://schema.org/BlogPosting">
        {/* Breadcrumb / Back button */}
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-gray hover:text-ink-charcoal rounded-full">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>

        {/* Hero Banner */}
        {post.bannerImage?.url && (
          <div className="relative mb-10 aspect-video overflow-hidden rounded-[16px] border border-hairline shadow-lg">
            <Image
              src={post.bannerImage.url}
              alt={post.bannerImage.altText || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Categories Pills */}
        <div className="mb-5 flex flex-wrap gap-2">
          {post.categories.map(cat => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="
                inline-flex items-center
                rounded-[8px] px-2.5 py-0.5
                text-xs font-semibold
                bg-lavender-mist text-vivid-violet
                hover:opacity-90 transition-opacity duration-150
              "
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1
          className="mb-6 text-3xl sm:text-[40px] md:text-[48px] font-bold tracking-tight text-ink-charcoal leading-tight"
          itemProp="headline"
        >
          {post.title}
        </h1>

        {/* Meta Info Bar */}
        <div className="mb-10 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-gray">
          {/* Author */}
          <div
            className="flex items-center gap-2 bg-pure-white border border-hairline px-3 py-1.5 rounded-full shadow-sm"
            itemProp="author"
            itemScope
            itemType="https://schema.org/Person"
          >
            <div className="h-6 w-6 rounded-full bg-surface-ivory border border-hairline flex items-center justify-center">
              <User className="h-3 w-3 text-ink-charcoal" />
            </div>
            <span className="text-ink-charcoal" itemProp="name">{post.author.name}</span>
          </div>

          {/* Date */}
          {post.publishedAt && (
            <time
              className="flex items-center gap-2 bg-pure-white border border-hairline px-3 py-1.5 rounded-full shadow-sm"
              dateTime={post.publishedAt.toISOString()}
              itemProp="datePublished"
            >
              <span className="text-ink-charcoal">{formatDate(post.publishedAt)}</span>
            </time>
          )}

          {/* Reading Time */}
          <div className="flex items-center gap-2 bg-pure-white border border-hairline px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-ink-charcoal">{readingTime} min read</span>
          </div>
        </div>

        {/* Excerpt Callout */}
        {post.excerpt && (
          <div className="mb-10">
            <Card variant="ivory" className="relative p-8 border-l-4 border-l-electric-cobalt">
              <p className="text-lg leading-relaxed text-ink-charcoal italic font-medium">
                "{post.excerpt}"
              </p>
            </Card>
          </div>
        )}

        {/* Grid for Article Content + TOC */}
        <div className="grid gap-10 lg:grid-cols-4 items-start">
          {/* Content */}
          <div className="lg:col-span-3">
            <Card variant="white" className="p-8 md:p-12">
              <div
                className="blog-content max-w-none"
                itemProp="articleBody"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </Card>
          </div>

          {/* TOC Sidebar */}
          {headings.length > 0 && (
            <aside className="lg:col-span-1 hidden lg:block sticky top-24">
              <Card variant="ivory" className="p-6">
                <TableOfContents headings={headings} />
              </Card>
            </aside>
          )}
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <Section className="mt-20 pt-10 border-t border-hairline">
            <div className="mb-10">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-lavender-mist px-3.5 py-1 text-xs font-medium text-vivid-violet">
                Read next
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-charcoal">
                Related Articles
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {relatedPosts.map((relPost) => (
                <PostCard key={relPost.id} post={relPost} />
              ))}
            </div>
          </Section>
        )}
      </article>
    </main>
  )
}
