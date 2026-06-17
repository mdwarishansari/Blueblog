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
import { Card } from '@/components/ui/Card'
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
        return 'bg-green-50 text-forest border border-green-100'
      case 'VERIFICATION_PENDING':
        return 'bg-lavender-mist text-vivid-violet border border-purple-100'
      default:
        return 'bg-canvas-cream text-slate-gray border border-hairline'
    }
  }

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-10">
      {/* ===== HERO / WELCOME ===== */}
      <Card variant="white" className="p-8 border border-hairline shadow-subtle relative overflow-hidden bg-gradient-to-br from-pure-white via-pure-white to-lavender-mist/40">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-lavender-mist px-3 py-1 text-xs font-semibold text-vivid-violet mb-4 shadow-sm border border-purple-100">
            <Sparkles className="h-3.5 w-3.5" />
            Dashboard Overview
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-charcoal leading-tight">
            Welcome back, {user.name}
          </h1>
          <p className="mt-2 text-sm text-slate-gray max-w-xl">
            Here's a quick overview of what's happening across your workspace today.
          </p>
        </div>
      </Card>

      {/* ===== STATS ===== */}
      <section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div>
            <StatCard title="Total Posts" value={postsCount} icon={FileText} />
          </div>
          <div>
            <StatCard title="Published" value={publishedPostsCount} icon={Eye} color="green" />
          </div>

          {/* Verification Pending Card - show to all */}
          <div>
            <StatCard
              title="Pending Review"
              value={pendingVerificationCount}
              icon={Clock}
              color="purple"
            />
          </div>

          {(isAdmin || isEditor) && (
            <div>
              <StatCard title="Categories" value={categoriesCount} icon={Folder} color="blue" />
            </div>
          )}

          {isAdmin && (
            <div>
              <StatCard title="Users" value={usersCount} icon={Users} color="purple" />
            </div>
          )}

          {isAdmin && (
            <div>
              <StatCard title="Media Files" value={imagesCount} icon={Image} color="yellow" />
            </div>
          )}

          {isAdmin && (
            <div>
              <StatCard title="Messages" value={messagesCount} icon={MessageSquare} color="red" />
            </div>
          )}
        </div>
      </section>

      {/* ===== PENDING VERIFICATION (Admin/Editor only) ===== */}
      {(isAdmin || isEditor) && pendingPosts.length > 0 && (
        <section>
          <Card variant="white" className="p-6 border-l-4 border-l-vivid-violet">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lavender-mist text-vivid-violet">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink-charcoal">Pending Verification</h2>
                  <p className="text-xs text-slate-gray">Posts awaiting your review</p>
                </div>
              </div>
              <Link href="/admin/posts?status=VERIFICATION_PENDING">
                <Button variant="secondary" size="sm" className="gap-1 rounded-full">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-[16px] bg-pure-white border border-hairline p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-ink-charcoal text-sm">{post.title}</h3>
                      <p className="mt-1 text-xs text-slate-gray">
                        By {post.author.name} • {formatDate(post.createdAt)}
                      </p>
                    </div>
                    <Link href={`/admin/posts/${post.id}/edit`}>
                      <Button size="sm" variant="outline" className="h-8 text-xs rounded-full border-hairline hover:bg-canvas-cream">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* ===== RECENT ACTIVITY ===== */}
      <section className={`grid gap-8 ${isAdmin ? 'lg:grid-cols-2' : ''}`}>
        {/* Recent Posts */}
        <Card variant="white" className="p-6">
          <div className="mb-6 flex items-center justify-between border-b border-hairline pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-charcoal">Recent Posts</h2>
            <Calendar className="h-4 w-4 text-slate-gray" />
          </div>

          <div className="space-y-3">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-[16px] border border-hairline bg-pure-white p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-ink-charcoal text-sm">{post.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-gray">
                        <span>By {post.author.name}</span>
                        <span>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>

                    <span className={`shrink-0 rounded-[8px] px-2.5 py-0.5 text-xs font-semibold ${getStatusStyle(post.status)}`}>
                      {post.status === 'VERIFICATION_PENDING' ? 'Pending' : post.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-hairline p-10 text-center bg-surface-ivory">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-pure-white border border-hairline">
                  <FileText className="h-5 w-5 text-slate-gray" />
                </div>
                <p className="text-xs text-slate-gray">No posts yet</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Messages */}
        {isAdmin && (
          <Card variant="white" className="p-6">
            <div className="mb-6 flex items-center justify-between border-b border-hairline pb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-charcoal">Recent Messages</h2>
              <MessageSquare className="h-4 w-4 text-slate-gray" />
            </div>

            <div className="space-y-3">
              {recentMessages.length > 0 ? (
                recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-[16px] border border-hairline bg-surface-ivory p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <h3 className="font-semibold text-ink-charcoal text-sm">{msg.name}</h3>
                    <p className="text-xs text-slate-gray mt-0.5">{msg.email}</p>
                    <p className="mt-2 line-clamp-2 text-xs text-ink-charcoal leading-relaxed">
                      {msg.message}
                    </p>
                    <p className="mt-3 text-[10px] font-semibold text-slate-gray">
                      {formatDate(msg.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[16px] border border-dashed border-hairline p-10 text-center bg-surface-ivory">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-pure-white border border-hairline">
                    <MessageSquare className="h-5 w-5 text-slate-gray" />
                  </div>
                  <p className="text-xs text-slate-gray">
                    No new messages
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}
