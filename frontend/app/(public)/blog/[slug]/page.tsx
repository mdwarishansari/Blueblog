import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, Tag } from 'lucide-react'

import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { renderTipTapContent } from '@/lib/renderContent'
import PostCard from '@/components/PostCard'
import { serverApiGet } from '@/lib/serverApi'

/* ---------------- DATA ---------------- */

async function getPost(slug: string) {
  try {
    const res = await serverApiGet<any>(
      `/posts/${slug}`,
      undefined,
      { revalidate: 30 }
    )
    return res.data
  } catch {
    return null
  }
}

async function getRelatedPosts(postId: string, categorySlugs: string[]) {
  const categorySlug = categorySlugs?.[0]
  if (!categorySlug) return []

  const res = await serverApiGet<any>(
    '/posts',
    { page: 1, pageSize: 10, category: categorySlug, sort: 'newest' },
    { revalidate: 30 }
  )

  const posts = res.data?.data ?? []
  return posts.filter((p: any) => p.id !== postId).slice(0, 3)
}

/* ---------------- SEO ---------------- */

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params

  const post = await getPost(slug)
  if (!post) {
    return { title: 'Post not found' }
  }

  const title = post.seoTitle || post.title
  const description =
    post.seoDescription || post.excerpt || 'Read this article on BlueBlog'

  const image = post.bannerImage?.url
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
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

export default async function BlogPostPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params

  const post = await getPost(slug)
  if (!post) notFound()

  // JSON → Date (MANDATORY)
  const publishedAt = post.publishedAt
    ? new Date(post.publishedAt)
    : null

  const relatedPosts = await getRelatedPosts(
    post.id,
    post.categories.map((c: any) => c.slug)
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
        <div className="mb-10 aspect-video overflow-hidden rounded-2xl bg-slate-200">
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
        {post.categories.map((cat: any) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            <Tag className="h-3 w-3" />
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Title */}
      <h1 className="mb-5 text-4xl font-extrabold leading-tight">
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

        {publishedAt && (
          <time
            className="flex items-center gap-1.5"
            dateTime={publishedAt.toISOString()}
            itemProp="datePublished"
          >
            <Calendar className="h-4 w-4" />
            {formatDate(publishedAt)}
          </time>
        )}
      </div>

      {/* Content */}
      <section className="rounded-2xl bg-card p-10">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>

      {/* Related */}
      {relatedPosts.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-2xl font-semibold">
            Related Articles
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {relatedPosts.map((p: any) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* Back */}
      <div className="mt-20 text-center">
        <Link href="/blog">
          <Button variant="outline">← Back to Blog</Button>
        </Link>
      </div>
    </article>
  )
}
