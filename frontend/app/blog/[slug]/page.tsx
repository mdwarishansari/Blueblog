import { notFound } from 'next/navigation'
import { FiCalendar, FiClock } from 'react-icons/fi'
import { formatDate } from '@/lib/utils/formatDate'

import BlogContent from '@/components/blog/BlogContent'
import SEO from '@/components/seo/SEO'

interface PageProps {
  params: { slug: string }
}

/* ================= FETCH POST ================= */
async function getPost(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/posts/slug/${slug}`,
    { cache: 'no-store' }
  )

  if (!res.ok) return null
  const json = await res.json()
  return json.data.post
}

/* ================= PAGE ================= */
export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const publishedDate = post.publishedAt
    ? formatDate(post.publishedAt)
    : '—'

  const wordCount = JSON.stringify(post.content || {}).split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <>
      <SEO
  title={post.seo_title || post.title}
  description={post.seo_description || post.excerpt}
  canonical={`/blog/${post.slug}`}
  ogImage={post.banner_image?.url}
/>


      {/* HERO IMAGE */}
      {post.bannerImage?.url && (
        <div className="relative w-full h-[60vh] bg-black">
          <img
            src={post.bannerImage.url}
            alt={post.title}
            className="object-cover w-full h-full opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 max-w-5xl px-6 pb-10 mx-auto text-white">
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
  {post.title}
</h1>

<div className="flex flex-wrap gap-6 text-sm font-medium text-gray-200">
  <span className="flex items-center gap-1">
    <FiCalendar size={14} />
    {publishedDate}
  </span>
  <span className="flex items-center gap-1">
    <FiClock size={14} />
    {readingTime} min read
  </span>
</div>

          </div>
        </div>
      )}

      {/* CONTENT */}
      <article className="max-w-3xl px-4 py-12 mx-auto">
        {/* Categories */}
        {post.categories?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.categories.map((cat: any) => (
              <span
                key={cat.id}
                className="px-3 py-1 text-sm font-medium rounded-full bg-primary-50 text-primary-700"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-8 text-lg italic text-gray-600">
            {post.excerpt}
          </p>
        )}

        {/* Blog Content */}
        <div className="prose prose-lg max-w-none">
          <BlogContent content={post.content} />
        </div>
      </article>
    </>
  )
}
