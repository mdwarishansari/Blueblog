import { notFound } from 'next/navigation'
import Head from 'next/head'
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

  const seoTitle = post.seoTitle || post.title
  const seoDescription =
    post.seoDescription || post.excerpt || 'Read this article on BlueBlog'
  const seoImage = post.bannerImage?.url
  const seoUrl = `${process.env['NEXT_PUBLIC_SITE_URL']}/blog/${post.slug}`

  return (
    <>
      {/* ---------------- SEO ---------------- */}
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={seoUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={seoUrl} />
        {seoImage && <meta property="og:image" content={seoImage} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {seoImage && <meta name="twitter:image" content={seoImage} />}
      </Head>

      {/* ---------------- CONTENT ---------------- */}
      <main className="bg-bg">
        <article className="mx-auto max-w-5xl px-6 py-14">

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
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author.name}
            </span>

            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </span>
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

          {/* Related */}
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
            <Link href="/blog">
              <Button variant="outline">
                ← Back to Blog
              </Button>
            </Link>
          </div>

        </article>
      </main>
    </>
  )
}
