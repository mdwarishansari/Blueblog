import CategoryCard from '@/components/CategoryCard'
import { serverApiGet } from '@/lib/serverApi'

export default async function CategoryGrid() {
  const res = await serverApiGet<any>('/categories', undefined, { revalidate: 60 })
  const categories = res.data || []

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-14 text-center">
        <p className="text-slate-600">No categories available.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category: any) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  )
}
