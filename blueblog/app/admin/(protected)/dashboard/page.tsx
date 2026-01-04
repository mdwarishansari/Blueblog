import { redirect } from 'next/navigation'
import { 
  FileText, 
  Users, 
  Folder, 
  Image, 
  MessageSquare,
  TrendingUp,
  Eye,
  Calendar
} from 'lucide-react'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StatCard from '@/components/StatCard'
import RecentPosts from '@/components/RecentPosts'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  const user = await requireAuth()
  
  // Redirect if not admin
  if (user.role !== 'ADMIN') {
    redirect('/admin/posts')
  }

  // Fetch stats
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
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.category.count(),
    prisma.user.count(),
    prisma.image.count(),
    prisma.contactMessage.count(),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true } },
        categories: true,
      },
    }),
    prisma.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { isRead: false },
    }),
  ])

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-400 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
        <p className="mt-2 opacity-90">Here's what's happening with your blog today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Posts"
          value={postsCount}
          icon={FileText}
          trend="+12%"
          color="primary"
        />
        <StatCard
          title="Published"
          value={publishedPostsCount}
          icon={Eye}
          trend="+8%"
          color="green"
        />
        <StatCard
          title="Categories"
          value={categoriesCount}
          icon={Folder}
          color="blue"
        />
        <StatCard
          title="Users"
          value={usersCount}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Media Files"
          value={imagesCount}
          icon={Image}
          color="yellow"
        />
        <StatCard
          title="Messages"
          value={messagesCount}
          icon={MessageSquare}
          trend={recentMessages.length > 0 ? `+${recentMessages.length} new` : undefined}
          color="red"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Posts */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{post.title}</h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>By {post.author.name}</span>
                      <span>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    post.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
            <MessageSquare className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentMessages.length > 0 ? (
              recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-lg border border-gray-100 bg-blue-50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{message.name}</h3>
                      <p className="mt-1 text-sm text-gray-600">{message.email}</p>
                      <p className="mt-2 text-gray-700 line-clamp-2">{message.message}</p>
                    </div>
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                      New
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">No new messages</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}