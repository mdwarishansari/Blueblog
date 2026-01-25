'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PostTable from '@/components/PostTable'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import PostSearchInput from '@/components/admin/PostSearchInput'
import { apiGet } from '@/lib/api'

export default function AdminPostsPage() {
  const searchParams = useSearchParams()

  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [total, setTotal] = useState(0)

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 20
  const skip = (page - 1) * limit

  const statusParam = searchParams.get('status')

const status =
  statusParam === 'PUBLISHED' ||
  statusParam === 'DRAFT' ||
  statusParam === 'VERIFICATION_PENDING' ||
  statusParam === 'SCHEDULED'
    ? statusParam
    : undefined

  const search = searchParams.get('search') || undefined

  const query = useMemo(() => {
    const q = new URLSearchParams({
      ...(search && { search }),
      ...(status && { status }),
    }).toString()
    return q
  }, [search, status])

  const safeTotalPages = Math.max(1, Math.ceil(total / limit))
  const hasPrev = page > 1
  const hasNext = page < safeTotalPages

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const meRes = await apiGet('/auth/me')
      const me = meRes.data?.user || meRes.user || meRes.data || meRes
      if (!mounted) return
      setUser(me)

      const postsRes = await apiGet('/admin/posts', {
        page,
        pageSize: limit,
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
        ...(me?.role === 'WRITER' ? { authorId: me.id } : {}),
      })

      if (!mounted) return
      setPosts(postsRes.data?.data || postsRes.data || [])
      setTotal(postsRes.meta?.total || 0)
    })().catch(() => {})
    return () => {
      mounted = false
    }
  }, [page, limit, status, search])

  return (
    /* 🔒 ABSOLUTE WIDTH LOCK */
    <section className="w-full max-w-full min-w-0 overflow-x-hidden space-y-8">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fg">Posts</h1>
          <p className="text-sm text-muted-foreground">
            Manage and publish blog content
          </p>
        </div>

        <Link href="/admin/posts/new">
          <Button className="gap-2 btn-glow btn-hover-effect">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="rounded-2xl bg-card p-5 elev-sm space-y-4 max-w-full overflow-x-hidden">
        <PostSearchInput />

        <div className="flex flex-wrap gap-2 rounded-xl bg-muted/60 p-1 shadow-inner">
  {[
  { label: 'All', href: '/admin/posts', active: !status },

  {
    label: 'Published',
    href: '/admin/posts?status=PUBLISHED',
    active: status === 'PUBLISHED',
  },

  {
    label: 'Drafts',
    href: '/admin/posts?status=DRAFT',
    active: status === 'DRAFT',
  },

  {
    label: 'Verification Pending',
    href: '/admin/posts?status=VERIFICATION_PENDING',
    active: status === 'VERIFICATION_PENDING',
  },

  {
    label: 'Scheduled',
    href: '/admin/posts?status=SCHEDULED',
    active: status === 'SCHEDULED',
  },
]
.map(tab => (
    <Link key={tab.label} href={tab.href}>
      <Button
        size="sm"
        variant={tab.active ? 'default' : 'ghost'}
        className={tab.active ? 'btn-glow' : ''}
      >
        {tab.label}
      </Button>
    </Link>
  ))}
</div>

      </div>

      {/* ================= TABLE ================= */}
      {/* 🔥 TABLE SCROLLS — PAGE NEVER DOES */}
      <div className="rounded-2xl bg-card elev-md overflow-x-hidden md:overflow-x-auto">
  <div className="w-full md:min-w-[900px]">
    {user && <PostTable posts={posts as any} user={user} />}
  </div>
</div>

{/* ================= PAGINATION ================= */}
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  {/* INFO */}
  <p className="text-sm text-muted-foreground">
    {total === 0
      ? 'No posts found'
      : `Showing ${skip + 1} – ${Math.min(skip + limit, total)} of ${total}`}
  </p>

  {/* CONTROLS */}
  <div className="flex items-center gap-3">
    {/* PREVIOUS */}
    {hasPrev ? (
      <Link
        href={`/admin/posts?page=${page - 1}${query ? `&${query}` : ''}`}
      >
        <Button size="sm" variant="outline">
          Previous
        </Button>
      </Link>
    ) : (
      <Button size="sm" variant="outline" disabled>
        Previous
      </Button>
    )}

    {/* PAGE INFO */}
    <span className="text-sm text-muted-foreground">
      Page {page} of {safeTotalPages}
    </span>

    {/* NEXT */}
    {hasNext ? (
      <Link
        href={`/admin/posts?page=${page + 1}${query ? `&${query}` : ''}`}
      >
        <Button size="sm" variant="outline">
          Next
        </Button>
      </Link>
    ) : (
      <Button size="sm" variant="outline" disabled>
        Next
      </Button>
    )}
  </div>
</div>


    </section>
  )
}
