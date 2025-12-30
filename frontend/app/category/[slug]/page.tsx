import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import SEO from '@/components/seo/SEO'
import BlogCard from '@/components/blog/BlogCard'

interface PageProps {
  params: {
    slug: string
  }
}

/* -------------------- FETCH CATEGORY -------------------- */
async function getCategory(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories/slug/${slug}`,
    { cache: 'no-store' }
  )

  if (!res.ok) return null
  const json = await res.json()
  return json.data.category
}

/* -------------------- FETCH CATEGORY POSTS -------------------- */
async function getCategoryPosts(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}/posts`,
    { cache: 'no-store' }
  )

  if (!res.ok) {
    console.error('Failed to fetch category posts')
    return null
  }

  const json = await res.json()
  return json.data
}

/* -------------------- PAGE -------------------- */
export default async function CategoryPage({ params }: PageProps) {
  const category = await getCategory(params.slug)
  if (!category) notFound()

  const result = await getCategoryPosts(params.slug)
  const posts = result?.posts || []
  const pagination = result?.pagination

  return (
    <>
      <SEO
        title={`${category.name} Articles`}
        description={`Browse articles in ${category.name}`}
        canonical={`/category/${category.slug}`}
      />

      <div className="px-4 py-10 mx-auto max-w-7xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
  items={[
    {
      label: category.name,
      href: `/category/${category.slug}`,
      current: true,
    },
  ]}
/>


        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            {category.name}
          </h1>
          <p className="mt-2 text-gray-600">
            {pagination?.total || 0} published articles
          </p>
        </div>

        {/* Posts */}
        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              No posts found
            </h3>
            <p className="mt-2 text-gray-600">
              No published posts in this category yet.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
