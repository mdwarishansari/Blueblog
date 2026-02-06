import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  Users,
  Folder,
  Image,
  MessageSquare,
  Eye,
  Calendar,
  Sparkles,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StatCard from '@/components/StatCard'
import { Button } from '@/components/ui/Button'
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
    pendingVerificationCount,
    categoriesCount,
    usersCount,
    imagesCount,
    messagesCount,
    recentPosts,
    recentMessages,
    pendingPosts,
  ] = await Promise.all([
    prisma.post.count({ where: isWriter ? { authorId: user.id } : {} }),

    prisma.post.count({
      where: {
        status: 'PUBLISHED',
        ...(isWriter ? { authorId: user.id } : {}),
      },
    }),

    // Verification pending count - for admin/editor show all, for writer show their own
    prisma.post.count({
      where: {
        status: 'VERIFICATION_PENDING',
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

    // Pending posts for admin/editor review
    (isAdmin || isEditor)
      ? prisma.post.findMany({
        where: { status: 'VERIFICATION_PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { name: true } },
        },
      })
      : [],
  ])

  // Status badge styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-700'
      case 'VERIFICATION_PENDING':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  return (
    <div className="space-y-10">
      {/* ===== HERO / WELCOME ===== */}
      <section className="relative overflow-hidden rounded-2xl gradient-bg p-8 text-white elev-md animate-fade-in">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm text-white/90 mb-3 animate-fade-in-down">
            <Sparkles className="h-3.5 w-3.5" />
            Dashboard Overview
          </div>
          <h1 className="text-2xl font-bold tracking-tight animate-fade-in-up">
            Welcome back, {user.name}
          </h1>
          <p className="mt-2 max-w-xl text-white/90 animate-fade-in-up stagger-2">
            Here's a quick overview of what's happening across your workspace today.
          </p>
        </div>

        {/* decorative blobs */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-blob" />
        <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 right-1/4 h-24 w-24 rounded-full bg-white/5 blur-xl animate-float" />
      </section>

      {/* ===== STATS ===== */}
      <section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="animate-fade-in-up stagger-1">
            <StatCard title="Total Posts" value={postsCount} icon={FileText} />
          </div>
          <div className="animate-fade-in-up stagger-2">
            <StatCard title="Published" value={publishedPostsCount} icon={Eye} color="green" />
          </div>

          {/* Verification Pending Card - show to all */}
          <div className="animate-fade-in-up stagger-3">
            <StatCard
              title="Pending Review"
              value={pendingVerificationCount}
              icon={Clock}
              color="yellow"
            />
          </div>

          {(isAdmin || isEditor) && (
            <div className="animate-fade-in-up stagger-4">
              <StatCard title="Categories" value={categoriesCount} icon={Folder} color="blue" />
            </div>
          )}

          {isAdmin && (
            <div className="animate-fade-in-up stagger-5">
              <StatCard title="Users" value={usersCount} icon={Users} color="purple" />
            </div>
          )}

          {isAdmin && (
            <div className="animate-fade-in-up stagger-6">
              <StatCard title="Media Files" value={imagesCount} icon={Image} color="yellow" />
            </div>
          )}

          {isAdmin && (
            <div className="animate-fade-in-up stagger-6">
              <StatCard title="Messages" value={messagesCount} icon={MessageSquare} color="red" />
            </div>
          )}
        </div>
      </section>

      {/* ===== PENDING VERIFICATION (Admin/Editor only) ===== */}
      {(isAdmin || isEditor) && pendingPosts.length > 0 && (
        <section className="animate-fade-in">
          <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 p-6 elev-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-fg">Pending Verification</h2>
                  <p className="text-sm text-muted-foreground">Posts awaiting your review</p>
                </div>
              </div>
              <Link href="/admin/posts?status=VERIFICATION_PENDING">
                <Button variant="outline" size="sm" className="gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {pendingPosts.map((post, index) => (
                <div
                  key={post.id}
                  className={`rounded-xl bg-white border border-orange-100 p-4 ui-transition hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-fg">{post.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        By {post.author.name} • {formatDate(post.createdAt)}
                      </p>
                    </div>
                    <Link href={`/admin/posts/${post.id}/edit`}>
                      <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== RECENT ACTIVITY ===== */}
      <section className={`grid gap-8 ${isAdmin ? 'lg:grid-cols-2' : ''}`}>
        {/* Recent Posts */}
        <div className="rounded-2xl bg-card p-6 elev-sm hover-glow animate-fade-in-left">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-fg">Recent Posts</h2>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-4">
            {recentPosts.length > 0 ? (
              recentPosts.map((post, index) => (
                <div
                  key={post.id}
                  className={`rounded-xl border border-border bg-white p-4 ui-transition hover:bg-muted hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
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

                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ui-transition ${getStatusStyle(post.status)}`}>
                      {post.status === 'VERIFICATION_PENDING' ? 'Pending' : post.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border p-10 text-center animate-fade-in">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 animate-pulse-glow">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No posts yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        {isAdmin && (
          <div className="rounded-2xl bg-card p-6 elev-sm hover-glow animate-fade-in-right">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-fg">Recent Messages</h2>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              {recentMessages.length > 0 ? (
                recentMessages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`rounded-xl border border-border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 ui-transition hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
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
                <div className="rounded-xl border border-dashed border-border p-10 text-center animate-fade-in">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 animate-pulse-glow">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
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
