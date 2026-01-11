import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, Tag } from 'lucide-react'

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

  return (
    
      <article
  className="mx-auto max-w-5xl px-6 py-14"
  itemScope
  itemType="https://schema.org/BlogPosting"
>


        {/* Banner */}
        {post.bannerImage?.url && (
          <div className="mb-10 aspect-video overflow-hidden rounded-2xl bg-slate-200 elev-sm">
            <Image
              src={post.bannerImage.url}
              alt={post.bannerImage.altText || post.title}
              width={1280}
              height={720}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        )}

        {/* Categories */}
        <div className="mb-4 flex flex-wrap gap-2">
          {post.categories.map(cat => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="
                inline-flex items-center gap-1.5
                rounded-full bg-indigo-50 px-3 py-1
                text-sm font-medium text-indigo-700
                ui-transition hover:bg-indigo-100
              "
            >
              <Tag className="h-3 w-3" />
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-fg">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="mb-12 flex items-center gap-6 text-sm text-slate-600">
          <span
  className="flex items-center gap-1.5"
  itemProp="author"
  itemScope
  itemType="https://schema.org/Person"
>
  <User className="h-4 w-4" />
  <span itemProp="name">{post.author.name}</span>
</span>


          {post.publishedAt && (
  <time
    className="flex items-center gap-1.5"
    dateTime={post.publishedAt.toISOString()}
    itemProp="datePublished"
  >
    <Calendar className="h-4 w-4" />
    {formatDate(post.publishedAt)}
  </time>
)}

        </div>

        {/* Article body */}
        <section className="rounded-2xl bg-card p-10 elev-sm">
          <div
            className="
              prose prose-lg max-w-none
              prose-headings:tracking-tight
              prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl
            "
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 text-2xl font-semibold text-fg">
              Related Articles
            </h2>

            <div className="grid gap-8 md:grid-cols-3">
              {relatedPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Back */}
        <div className="mt-20 text-center">
          <Link href="/blog" aria-label="Back to BlueBlog blog listing">

            <Button variant="outline">
              ← Back to Blog
            </Button>
          </Link>
        </div>

      </article>
  )
}
