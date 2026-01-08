import { prisma } from '@/lib/prisma'
import CategoryCard from '@/components/CategoryCard'
import { generateSEO } from '@/lib/seo'
export const revalidate = 60

export const metadata = generateSEO({
  title: 'Categories',
  description: 'Explore articles by topic.',
  url: '/category',
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
    <section className="min-h-screen bg-bg py-20">
      <div className="container">

        {/* ================= HEADER ================= */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-fg">
            Browse Categories
          </h1>
          <p className="text-lg text-slate-600">
            Explore articles by topic
          </p>
        </div>

        {/* ================= GRID ================= */}
        {categories.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-14 text-center">
            <p className="text-slate-600">
              No categories available.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
