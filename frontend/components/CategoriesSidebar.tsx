import CategoryFilter from '@/components/CategoryFilter'
import { serverApiGet } from '@/lib/serverApi'

export default async function CategoriesSidebar() {
  const res = await serverApiGet<any>('/categories', undefined, { revalidate: 60 })
  const categories = res.data || []

  return <CategoryFilter categories={categories} />
}
