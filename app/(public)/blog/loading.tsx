import {
  PageHeaderSkeleton,
  SidebarSkeleton,
  PostCardSkeleton,
} from '@/components/skeletons'

export default function Loading() {
  return (
    <div className="min-h-screen">
      <section className="py-20">
        <div className="container">
          <PageHeaderSkeleton />
        </div>
      </section>

      <section className="py-16">
        <div className="container grid gap-10 lg:grid-cols-4">
          <aside>
            <SidebarSkeleton />
          </aside>

          <main className="lg:col-span-3 grid gap-8 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </main>
        </div>
      </section>
    </div>
  )
}
