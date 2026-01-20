'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Users,
  Folder,
  Image,
  MessageSquare,
  Eye,
  Calendar,
} from 'lucide-react'
import StatCard from '@/components/StatCard'
import { formatDate } from '@/lib/utils'
import { apiGet } from '@/lib/api'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [postsCount, setPostsCount] = useState(0)
  const [publishedPostsCount, setPublishedPostsCount] = useState(0)
  const [categoriesCount, setCategoriesCount] = useState(0)
  const [usersCount, setUsersCount] = useState(0)
  const [imagesCount, setImagesCount] = useState(0)
  const [messagesCount, setMessagesCount] = useState(0)
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [recentMessages, setRecentMessages] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const meRes = await apiGet('/auth/me')
      const me = meRes.data?.user || meRes.user || meRes.data || meRes
      if (!me) {
        router.replace('/admin/login')
        return
      }
      if (!mounted) return
      setUser(me)

      const postsRes = await apiGet('/admin/posts', {
        page: 1,
        pageSize: 5,
        ...(me.role === 'WRITER' ? { authorId: me.id } : {}),
      })
      const publishedRes = await apiGet('/admin/posts', {
        page: 1,
        pageSize: 1,
        status: 'PUBLISHED',
        ...(me.role === 'WRITER' ? { authorId: me.id } : {}),
      })

      if (!mounted) return
      setRecentPosts(postsRes.data?.data || postsRes.data || [])
      setPostsCount(postsRes.meta?.total || 0)
      setPublishedPostsCount(publishedRes.meta?.total || 0)

      if (me.role === 'ADMIN' || me.role === 'EDITOR') {
        const catsRes = await apiGet('/admin/categories')
        if (!mounted) return
        setCategoriesCount((catsRes.data || []).length)
      }

      if (me.role === 'ADMIN') {
        const [uRes, mediaRes, msgRes] = await Promise.all([
          apiGet('/admin/users'),
          apiGet('/admin/media'),
          apiGet('/admin/messages', { page: 1, pageSize: 5, isRead: false }),
        ])
        if (!mounted) return
        setUsersCount((uRes.data || []).length)
        setImagesCount((mediaRes.data?.images || mediaRes.data || []).length)
        setRecentMessages(msgRes.data || [])
        setMessagesCount(msgRes.meta?.total || 0)
      }
    })().catch(() => {})

    return () => {
      mounted = false
    }
  }, [router])

  const isAdmin = user?.role === 'ADMIN'
  const isEditor = user?.role === 'EDITOR'

  return (
    <div className="space-y-10">
      {/* ===== HERO / WELCOME ===== */}
      <section className="relative overflow-hidden rounded-2xl gradient-bg p-8 text-white elev-md">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name || ''}
          </h1>
          <p className="mt-2 max-w-xl text-white/90">
            Here’s a quick overview of what’s happening across your workspace today.
          </p>
        </div>

        {/* decorative blobs */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-blob" />
        <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl animate-blob animation-delay-2000" />
      </section>

      {/* ===== STATS ===== */}
      <section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Total Posts" value={postsCount} icon={FileText} />
          <StatCard title="Published" value={publishedPostsCount} icon={Eye} color="green" />

          {(isAdmin || isEditor) && (
            <StatCard title="Categories" value={categoriesCount} icon={Folder} color="blue" />
          )}

          {isAdmin && (
            <StatCard title="Users" value={usersCount} icon={Users} color="purple" />
          )}

          {isAdmin && (
            <StatCard title="Media Files" value={imagesCount} icon={Image} color="yellow" />
          )}

          {isAdmin && (
            <StatCard title="Messages" value={messagesCount} icon={MessageSquare} color="red" />
          )}
        </div>
      </section>

      {/* ===== RECENT ACTIVITY ===== */}
      <section className={`grid gap-8 ${isAdmin ? 'lg:grid-cols-2' : ''}`}>
        {/* Recent Posts */}
        <div className="rounded-2xl bg-card p-6 elev-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-fg">Recent Posts</h2>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-4">
            {recentPosts.map(post => (
              <div
                key={post.id}
                className="rounded-xl border border-border bg-white p-4 ui-transition hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-fg">{post.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>By {post.author?.name || ''}</span>
                      <span>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      post.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        {isAdmin && (
          <div className="rounded-2xl bg-card p-6 elev-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-fg">Recent Messages</h2>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              {recentMessages.length > 0 ? (
                recentMessages.map(msg => (
                  <div
                    key={msg.id}
                    className="rounded-xl border border-border bg-blue-50 p-4"
                  >
                    <h3 className="font-medium text-fg">{msg.name}</h3>
                    <p className="text-sm text-muted-foreground">{msg.email}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-fg">
                      {msg.message}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {formatDate(msg.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                  <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No new messages
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
