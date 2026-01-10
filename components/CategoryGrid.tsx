import { prisma } from '@/lib/prisma'
import CategoryCard from '@/components/CategoryCard'

export default async function CategoryGrid() {
  const categories = await prisma.category.findMany({
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

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-14 text-center">
        <p className="text-slate-600">No categories available.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map(category => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  )
}
