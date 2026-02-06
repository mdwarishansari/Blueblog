import { prisma } from '@/lib/prisma'
import CategoryCard from '@/components/CategoryCard'
import { FolderOpen } from 'lucide-react'

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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-14 text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse-glow">
          <FolderOpen className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-slate-600">No categories available.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category, index) => (
        <div
          key={category.id}
          className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
        >
          <CategoryCard category={category} />
        </div>
      ))}
    </div>
  )
}
