
import { prisma } from '@/lib/prisma'
import CategoryCard from '@/components/CategoryCard'

import { generateSEO } from '@/lib/seo'
import { Metadata } from 'next'

export const metadata: Metadata = generateSEO({
  title: 'Categories',
  description: 'Browse all blog categories',
})

async function getCategories() {
  return prisma.category.findMany({
    include: {
      image: true,
      _count: {
        select: {
          posts: {
            where: {
              status: 'PUBLISHED',
              publishedAt: { lte: new Date() },
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <section className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Browse Categories
          </h1>
          <p className="text-lg text-gray-600">
            Explore articles by topic
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group relative rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <CategoryCard category={category} />

                {/* CTA */}
                <div className="mt-4 text-center">
                  
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-white p-12 text-center">
            <p className="text-gray-600">No categories available.</p>
          </div>
        )}
      </div>
    </section>
  )
}
