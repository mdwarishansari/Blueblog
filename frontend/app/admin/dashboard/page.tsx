'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { postApi } from '@/lib/api/posts'
import { categoryApi } from '@/lib/api/categories'
import { FiFileText, FiFolder, FiUsers, FiBarChart2, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'
import AdminLayout from '@/components/layout/AdminLayout'
import Loading from '@/components/ui/Loading'
import Link from 'next/link'

interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalCategories: number
  totalUsers: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
    try {
      const [postsRes, categoriesRes] = await Promise.all([
        postApi.getAll({ limit: 5, sort: '-created_at' }),
        categoryApi.getAll()
      ])

      const posts = postsRes.data || []
      const categories = categoriesRes.data || []

      const dashboardStats: DashboardStats = {
        totalPosts: posts.length,
        publishedPosts: posts.filter((p: any) => p.status === 'PUBLISHED').length,
        draftPosts: posts.filter((p: any) => p.status === 'DRAFT').length,
        totalCategories: categories.length,
        totalUsers: 0, // You can add user API call if needed
      }

      setStats(dashboardStats)
      setRecentPosts(posts.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      await postApi.delete(postId)
      setRecentPosts(recentPosts.filter(post => post.id !== postId))
      if (stats) {
        setStats({
          ...stats,
          totalPosts: stats.totalPosts - 1,
          [recentPosts.find(p => p.id === postId)?.status === 'PUBLISHED' ? 'publishedPosts' : 'draftPosts']: 
            stats[recentPosts.find(p => p.id === postId)?.status === 'PUBLISHED' ? 'publishedPosts' : 'draftPosts'] - 1
        })
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  if (authLoading || loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return null
  }

  const statCards = [
    {
      title: 'Total Posts',
      value: stats?.totalPosts || 0,
      icon: FiFileText,
      color: 'bg-blue-500',
      change: '+12%',
      link: '/admin/posts',
    },
    {
      title: 'Published',
      value: stats?.publishedPosts || 0,
      icon: FiFileText,
      color: 'bg-green-500',
      change: '+8%',
      link: '/admin/posts?status=PUBLISHED',
    },
    {
      title: 'Drafts',
      value: stats?.draftPosts || 0,
      icon: FiFileText,
      color: 'bg-yellow-500',
      change: '+3',
      link: '/admin/posts?status=DRAFT',
    },
    {
      title: 'Categories',
      value: stats?.totalCategories || 0,
      icon: FiFolder,
      color: 'bg-purple-500',
      change: '+2',
      link: '/admin/categories',
    },
    {
      title: 'Users',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'bg-pink-500',
      change: '+5%',
      link: '/admin/users',
    },
    {
      title: 'SEO Score',
      value: '92%',
      icon: FiBarChart2,
      color: 'bg-indigo-500',
      change: '+2%',
      link: '/admin/seo',
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-primary-100">
                Here's what's happening with your blog today.
              </p>
            </div>
            <div className="hidden md:block">
              <Link
                href="/admin/posts/new"
                className="flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <FiPlus size={20} />
                New Post
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <Link
              key={index}
              href={stat.link}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon size={24} className="text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Posts & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Posts</h2>
              <Link
                href="/admin/posts"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-medium text-gray-900 hover:text-primary-600 truncate block"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        post.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status}
                      </span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="p-2 text-gray-600 hover:text-primary-600"
                    >
                      <FiEdit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-gray-600 hover:text-red-600"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              
              {recentPosts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No posts yet. Create your first post!
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/admin/posts/new"
                className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200">
                  <FiPlus size={24} className="text-blue-600" />
                </div>
                <span className="font-medium text-gray-900">New Post</span>
              </Link>
              
              <Link
                href="/admin/categories"
                className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200">
                  <FiFolder size={24} className="text-green-600" />
                </div>
                <span className="font-medium text-gray-900">Categories</span>
              </Link>
              
              <Link
                href="/admin/images"
                className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200">
                  <FiFileText size={24} className="text-purple-600" />
                </div>
                <span className="font-medium text-gray-900">Media Library</span>
              </Link>
              
              <Link
                href="/admin/seo"
                className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200">
                  <FiBarChart2 size={24} className="text-indigo-600" />
                </div>
                <span className="font-medium text-gray-900">SEO Analysis</span>
              </Link>
            </div>
            
            {/* Recent Activity */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>You published "Getting Started with Next.js"</span>
                  <span className="text-gray-500 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>You created a new category "Web Development"</span>
                  <span className="text-gray-500 ml-auto">1 day ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>You updated your profile information</span>
                  <span className="text-gray-500 ml-auto">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}