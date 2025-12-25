import { useState, useEffect, useCallback } from 'react'
import { postApi } from '@/lib/api/posts'
import { Post } from '@/types'

interface UsePostsOptions {
  page?: number
  limit?: number
  search?: string
  category?: string
  author?: string
  status?: string
  sort?: string
}

export function usePosts(options: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await postApi.getAll(options)
      
      if (response.status === 'success') {
        setPosts(response.data || [])
        setPagination(response.pagination || null)
      } else {
        setError(response.message || 'Failed to fetch posts')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [options])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const refetch = () => {
    fetchPosts()
  }

  return {
    posts,
    loading,
    error,
    pagination,
    refetch,
  }
}