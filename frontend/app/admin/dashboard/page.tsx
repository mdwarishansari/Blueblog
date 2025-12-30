'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiPlus,
  FiEdit,
  FiTrash2,
} from 'react-icons/fi'
import type { Post } from '@/types'
import { useAuth } from '@/lib/hooks/useAuth'
import { postApi } from '@/lib/api/posts'
import { categoryApi } from '@/lib/api/categories'
import { imageApi } from '@/lib/api/images'
import { userApi } from '@/lib/api/users'

import AdminLayout from '@/components/layout/AdminLayout'
import AdminPage from '@/components/guards/AdminPage'
import Loading from '@/components/ui/Loading'

/* ================= TYPES ================= */

interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalCategories: number
  totalImages: number
  totalUsers: number
}

/* ================= PAGE ================= */

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  /* ---------- AUTH ---------- */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [authLoading, isAuthenticated, router])

  /* ---------- FETCH ---------- */
  useEffect(() => {
    if (isAuthenticated) fetchDashboardData()
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
  try {
    setLoading(true)

    // 🔐 WRITER DASHBOARD
if (user?.role === 'WRITER') {
  const postsResult = await postApi.getAll({ limit: 1000 })

  const posts: Post[] = (postsResult.posts ?? []).filter(
    (p: Post) => p.author?.id === user.id
  )

  const publishedPosts = posts.filter(
    (p: Post) => p.status === 'PUBLISHED'
  ).length

  const draftPosts = posts.filter(
    (p: Post) => p.status === 'DRAFT'
  ).length

  setStats({
    totalPosts: posts.length,
    publishedPosts,
    draftPosts,
    totalCategories: 0,
    totalImages: 0,
    totalUsers: 0,
  })

  setRecentPosts(posts.slice(0, 5))
  return
}


    // 🔐 ADMIN / EDITOR DASHBOARD (UNCHANGED)
    const [
      postsResult,
      categoriesResult,
      imagesResult,
      usersResult,
    ] = await Promise.all([
      postApi.getAll({ limit: 1000 }),
      categoryApi.getAll(),
      imageApi.getAll(),
      userApi.getAll(),
    ])


      /* ---------- POSTS ---------- */
      const posts: Post[] = postsResult?.posts ?? []


      const publishedPosts = posts.filter(
        (p: any) => p.status === 'PUBLISHED'
      ).length

      const draftPosts = posts.filter(
        (p: any) => p.status === 'DRAFT'
      ).length

      /* ---------- CATEGORIES ---------- */
      const categories =
        categoriesResult?.categories ?? []

      /* ---------- IMAGES ---------- */
      const images =
        imagesResult?.images ?? []

      /* ---------- USERS ---------- */
      const users =
        usersResult?.users ?? []

      /* ---------- SET STATS ---------- */
      setStats({
        totalPosts: posts.length,
        publishedPosts,
        draftPosts,
        totalCategories: categories.length,
        totalImages: images.length,
        totalUsers: users.length,
      })

      /* ---------- RECENT POSTS ---------- */
      setRecentPosts(
        [...posts]
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 5)
      )

    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  /* ---------- DELETE ---------- */
  const handleDeletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    await postApi.delete(id)
    fetchDashboardData()
  }

  if (authLoading || loading) return <Loading />
  if (!user) return null

  /* ================= RENDER ================= */

  return (
    <AdminPage>
      <AdminLayout>
        <div className="space-y-8">

          {/* HEADER */}
          <div className="p-6 text-white rounded-xl bg-primary-600">
            <h1 className="text-2xl font-bold">
              Welcome back, {user.name}
            </h1>
            <p className="text-primary-100">
              Dashboard overview
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Stat title="Total Posts" value={stats?.totalPosts} />
            <Stat title="Published Posts" value={stats?.publishedPosts} />
            <Stat title="Draft Posts" value={stats?.draftPosts} />
            <Stat title="Categories" value={stats?.totalCategories} />
            <Stat title="Images" value={stats?.totalImages} />
            <Stat title="Users" value={stats?.totalUsers} />
          </div>

          {/* RECENT POSTS */}
          <div className="p-6 bg-white rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Posts</h2>
              <Link
                href="/admin/posts/new"
                className="flex items-center gap-2 btn-primary"
              >
                <FiPlus /> New Post
              </Link>
            </div>

            {recentPosts.length === 0 ? (
              <p className="text-gray-500">No posts found</p>
            ) : (
              recentPosts.map(post => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 mb-2 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{post.title}</p>
                    <span className="text-xs text-gray-500">
                      {post.status}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Link href={`/admin/posts/${post.id}`}>
                      <FiEdit />
                    </Link>
                    <button onClick={() => handleDeletePost(post.id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminPage>
  )
}

/* ================= COMPONENT ================= */

function Stat({ title, value }: { title: string; value?: number }) {
  return (
    <div className="p-6 bg-white rounded-xl">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold">
        {value ?? 0}
      </p>
    </div>
  )
}
