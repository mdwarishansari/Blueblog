import { notFound } from 'next/navigation'
import SEO from '@/components/seo/SEO'
import BlogContent from '@/components/blog/BlogContent'
import RelatedPosts from '@/components/blog/RelatedPosts'
import { FiCalendar, FiClock, FiTag } from 'react-icons/fi'
import { formatDate } from '@/lib/utils/formatDate'

interface PageProps {
  params: {
    slug: string
  }
}

/* ================= FETCH POST ================= */
async function getPost(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/posts/slug/${slug}`,
      { cache: 'no-store' }
    )

    if (!res.ok) return null
    const json = await res.json()
    return json.data
  } catch {
    return null
  }
}

/* ================= RELATED POSTS ================= */
async function getRelatedPosts(postId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/related`,
      { cache: 'no-store' }
    )

    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

/* ================= METADATA ================= */
export async function generateMetadata({ params }: PageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    }
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
  }
}

/* ================= PAGE ================= */
export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const relatedPosts = await getRelatedPosts(post.id)

  const publishedDate = post.publishedAt
    ? formatDate(post.publishedAt)
    : '—'

  const wordCount = JSON.stringify(post.content || {}).split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <>
      <SEO
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt}
        canonical={`/blog/${post.slug}`}
        ogImage={post.bannerImage?.url}
        ogType="article"
      />

      <article className="max-w-4xl px-4 py-10 mx-auto">
        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap gap-6 mb-6 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <FiCalendar size={14} />
            {publishedDate}
          </span>
          <span className="flex items-center gap-1">
            <FiClock size={14} />
            {readingTime} min read
          </span>
        </div>

        {/* Categories */}
        {post.categories?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.categories.map((cat: any) => (
              <a
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-primary-50 text-primary-700"
              >
                <FiTag size={12} />
                {cat.name}
              </a>
            ))}
          </div>
        )}

        {/* Featured Image */}
        {post.bannerImage?.url && (
          <img
            src={post.bannerImage.url}
            alt={post.title}
            className="w-full mb-8 rounded-xl"
          />
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {post.content ? (
            <BlogContent content={post.content} />
          ) : (
            <p className="text-gray-500">No content available.</p>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <RelatedPosts posts={relatedPosts} currentPostId={post.id} />
          </div>
        )}
      </article>
    </>
  )
}
