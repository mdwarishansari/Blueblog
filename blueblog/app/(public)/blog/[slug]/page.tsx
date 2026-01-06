import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, Tag } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { renderTipTapContent } from '@/lib/renderContent'

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

  // ✅ ALWAYS convert TipTap JSON → HTML
  const html = renderTipTapContent(post.content)

  return (
    <main className="bg-gray-50">
      <article className="mx-auto max-w-5xl px-6 py-10">

        {/* IMAGE (16:9) */}
        {post.bannerImage?.url && (
          <div className="mb-8 aspect-video overflow-hidden rounded-xl bg-gray-200">
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

        {/* CATEGORIES */}
        <div className="mb-3 flex flex-wrap gap-2">
          {post.categories.map(cat => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
            >
              <Tag className="h-3 w-3" />
              {cat.name}
            </Link>
          ))}
        </div>

        {/* TITLE */}
        <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900">
          {post.title}
        </h1>

        {/* META */}
        <div className="mb-10 flex flex-wrap items-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {post.author.name}
          </span>
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt)}
            </span>
          )}
        </div>

        {/* CONTENT (NO JSON EVER) */}
        <section className="rounded-xl bg-white p-8 shadow-sm">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>

        {/* RELATED POSTS */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              Related Articles
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map(rp => (
                <Link
                  key={rp.id}
                  href={`/blog/${rp.slug}`}
                  className="rounded-lg border bg-white p-5 hover:shadow transition"
                >
                  <h3 className="mb-2 font-medium text-gray-900">
                    {rp.title}
                  </h3>
                  {rp.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {rp.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* BACK */}
        <div className="mt-16 text-center">
          <Link href="/blog">
            <Button variant="outline">← Back to Blog</Button>
          </Link>
        </div>
      </article>
    </main>
  )
}
