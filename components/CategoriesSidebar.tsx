import { prisma } from '@/lib/prisma'
import CategoryFilter from '@/components/CategoryFilter'

export default async function CategoriesSidebar() {
  const categories = await prisma.category.findMany({
    include: {
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

  return <CategoryFilter categories={categories} />
}
