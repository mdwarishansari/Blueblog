'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { postApi } from '@/lib/api/posts'
import { FiPlus, FiEdit, FiTrash2, FiEye, FiFilter, FiSearch, FiDownload } from 'react-icons/fi'
import AdminLayout from '@/components/layout/AdminLayout'
import Loading from '@/components/ui/Loading'
import { formatDate } from '@/lib/utils/formatDate'

interface Post {
  id: string
  title: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED'
  published_at: string
  created_at: string
  author: {
    name: string
  }
  categories: Array<{
    name: string
  }>
}

export default function AdminPostsPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts()
    }
  }, [isAuthenticated, currentPage, statusFilter, search])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit: 20,
        sort: '-created_at'
      }
      
      if (statusFilter !== 'ALL') {
        params.status = statusFilter
      }
      
      if (search) {
        params.search = search
      }
      
      const response = await postApi.getAll(params)
      
      if (response.status === 'success' && response.data) {
        setPosts(response.data as Post[])
        setTotalPages(response.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    try {
      await postApi.delete(postId)
      setPosts(posts.filter(post => post.id !== postId))
      setSelectedPosts(selectedPosts.filter(id => id !== postId))
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedPosts.length || !confirm(`Delete ${selectedPosts.length} posts?`)) return
    
    try {
      await Promise.all(selectedPosts.map(id => postApi.delete(id)))
      setPosts(posts.filter(post => !selectedPosts.includes(post.id)))
      setSelectedPosts([])
    } catch (error) {
      console.error('Error bulk deleting posts:', error)
      alert('Failed to delete posts')
    }
  }

  const handleBulkPublish = async () => {
    if (!selectedPosts.length || !confirm(`Publish ${selectedPosts.length} posts?`)) return
    
    try {
      await Promise.all(selectedPosts.map(id => postApi.publish(id)))
      fetchPosts() // Refresh the list
      setSelectedPosts([])
    } catch (error) {
      console.error('Error bulk publishing posts:', error)
      alert('Failed to publish posts')
    }
  }

  const toggleSelectPost = (postId: string) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(posts.map(post => post.id))
    }
  }

  if (authLoading || loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Posts Management</h1>
            <p className="text-gray-600">Create, edit, and manage your blog posts</p>
          </div>
          
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 btn-primary"
          >
            <FiPlus size={18} />
            New Post
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search posts by title, author, or content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full input-field"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FiFilter size={20} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            
            {/* Export Button */}
            <button className="btn-secondary inline-flex items-center gap-2">
              <FiDownload size={18} />
              Export
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedPosts.length > 0 && (
            <div className="flex items-center justify-between bg-primary-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedPosts.length === posts.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-primary-800">
                  {selectedPosts.length} posts selected
                </span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleBulkPublish}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  Publish Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Posts Table */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedPosts.length === posts.length && posts.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={() => toggleSelectPost(post.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate block max-w-md"
                          >
                            {post.title}
                          </Link>
                          <div className="text-xs text-gray-500">
                            /{post.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {post.categories?.slice(0, 2).map((cat, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800"
                          >
                            {cat.name}
                          </span>
                        ))}
                        {post.categories && post.categories.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{post.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.author?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.published_at ? formatDate(post.published_at) : 'Not published'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-1 text-gray-600 hover:text-primary-600"
                          title="Preview"
                        >
                          <FiEye size={16} />
                        </Link>
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="p-1 text-gray-600 hover:text-primary-600"
                          title="Edit"
                        >
                          <FiEdit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1 text-gray-600 hover:text-red-600"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {posts.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FiPlus size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No posts found
              </h3>
              <p className="text-gray-600 mb-6">
                {search || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first post'}
              </p>
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center gap-2 btn-primary"
              >
                <FiPlus size={18} />
                Create New Post
              </Link>
            </div>
          )}

          {/* Pagination */}
          {posts.length > 0 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * 20, posts.length)}</span> of{' '}
                <span className="font-medium">{posts.length}</span> results
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center border rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {posts.length}
            </div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
          
          <div className="card">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {posts.filter(p => p.status === 'PUBLISHED').length}
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          
          <div className="card">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {posts.filter(p => p.status === 'DRAFT').length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
          
          <div className="card">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {new Set(posts.flatMap(p => p.categories?.map(c => c.name) || [])).size}
            </div>
            <div className="text-sm text-gray-600">Categories Used</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}