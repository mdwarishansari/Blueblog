import Link from 'next/link'
import SEO from '@/components/seo/SEO'
import { FiFolder } from 'react-icons/fi'

interface Category {
  id: string
  name: string
  slug: string
  _count?: {
    posts: number
  }
}

/* ================= FETCH CATEGORIES ================= */
async function getCategories() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories`,
    { cache: 'no-store' }
  )

  if (!res.ok) return []

  const json = await res.json()

  // ✅ THIS IS THE IMPORTANT FIX
  return json.data?.categories || []
}

/* ================= PAGE ================= */
export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <>
      <SEO
  title="Categories"
  description="Browse articles by category."
  canonical="/category"
/>


      <div className="px-4 py-12 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Categories</h1>
          <p className="mt-2 text-gray-600">
            Explore articles organized by topic
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat: Category) => (
              <div
                key={cat.id}
                className="p-6 transition bg-white border rounded-xl hover:shadow-md"
              >
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-primary-100">
                  <FiFolder className="text-primary-600" size={24} />
                </div>

                <h3 className="mb-1 text-lg font-semibold text-gray-900">
                  {cat.name}
                </h3>

                <p className="mb-4 text-sm text-gray-500">
                  {cat._count?.posts ?? 0} articles
                </p>

                <Link
                  href={`/category/${cat.slug}`}
                  className="inline-flex items-center gap-1 font-medium text-primary-600 hover:text-primary-700"
                >
                  Explore →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-500">
            No categories available.
          </div>
        )}
      </div>
    </>
  )
}
