import apiClient from './client'
import { Category, ApiResponse } from '@/types'

export const categoryApi = {
  // =========================
  // GET ALL CATEGORIES
  // =========================
  getAll: async () => {
  const res = await apiClient.get('/categories')
  return res.data as {
    categories: Category[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
},

  // =========================
  // GET CATEGORY BY SLUG
  // =========================
  getBySlug: async (slug: string): Promise<ApiResponse<{ category: Category }>> => {
    const response = await apiClient.get(`/categories/slug/${slug}`)
    return response.data
  },

  // =========================
  // GET POSTS BY CATEGORY SLUG
  // =========================
  getPostsBySlug: async (
    slug: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(
      `/categories/${slug}/posts`,
      { params }
    )
    return response.data
  },

  // =========================
  // CREATE CATEGORY (ADMIN)
  // =========================
  create: async (
    data: { name: string; slug: string }
  ): Promise<ApiResponse<{ category: Category }>> => {
    const response = await apiClient.post('/categories', data)
    return response.data
  },

  // =========================
  // UPDATE CATEGORY (ADMIN)
  // =========================
  update: async (
    id: string,
    data: Partial<Category>
  ): Promise<ApiResponse<{ category: Category }>> => {
    const response = await apiClient.put(`/categories/${id}`, data)
    return response.data
  },

  // =========================
  // DELETE CATEGORY (ADMIN)
  // =========================
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/categories/${id}`)
    return response.data
  },
}
