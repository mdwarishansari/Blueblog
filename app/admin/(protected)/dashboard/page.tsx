import { redirect } from 'next/navigation'
import {
  FileText,
  Users,
  Folder,
  Image,
  MessageSquare,
  Eye,
  Calendar,
} from 'lucide-react'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StatCard from '@/components/StatCard'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  const user = await requireAuth()

  const isAdmin = user.role === 'ADMIN'
  const isEditor = user.role === 'EDITOR'
  const isWriter = user.role === 'WRITER'

  if (!isAdmin && !isEditor && !isWriter) {
    redirect('/admin/login')
  }

  const [
    postsCount,
    publishedPostsCount,
    categoriesCount,
    usersCount,
    imagesCount,
    messagesCount,
    recentPosts,
    recentMessages,
  ] = await Promise.all([
    prisma.post.count({ where: isWriter ? { authorId: user.id } : {} }),

    prisma.post.count({
      where: {
        status: 'PUBLISHED',
        ...(isWriter ? { authorId: user.id } : {}),
      },
    }),

    isWriter ? 0 : prisma.category.count(),
    isAdmin ? prisma.user.count() : 0,
    isAdmin ? prisma.image.count() : 0,
    isAdmin ? prisma.contactMessage.count() : 0,

    prisma.post.findMany({
      where: isWriter ? { authorId: user.id } : {},
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true } },
        categories: true,
      },
    }),

    isAdmin
      ? prisma.contactMessage.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          where: { isRead: false },
        })
      : [],
  ])

  return (
    <div className="space-y-10">
      {/* ===== HERO / WELCOME ===== */}
      <section className="relative overflow-hidden rounded-2xl gradient-bg p-8 text-white elev-md">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user.name}
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
                      <span>By {post.author.name}</span>
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
