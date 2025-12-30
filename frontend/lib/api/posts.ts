import apiClient from './client';
import { Post, ApiResponse } from '@/types';

export const postApi = {
  // Get all posts (public)
  getAll: async (params?: {
  page?: number
  limit?: number
  search?: string
  category?: string
  author?: string
  status?: string
  sort?: string
}) => {
  const res = await apiClient.get('/posts', { params })
  return res.data.data as {
    posts: Post[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
},


  // Get single post by slug (public)
  getBySlug: async (slug: string) => {
    const response = await apiClient.get<ApiResponse<Post>>(`/posts/slug/${slug}`);
    return response.data;
  },

  // Get single post by ID (ADMIN / EDIT)
getById: async (id: string) => {
  const res = await apiClient.get(`/posts/${id}`)
  return res.data.data as { post: Post }
},



  // Create post (admin/writer)
  create: async (postData: Partial<Post>) => {
  const res = await apiClient.post('/posts', postData)
  return res.data.data as { post: Post }
},



  // Update post
  update: async (id: string, postData: Partial<Post>) => {
    const response = await apiClient.put<ApiResponse<Post>>(`/posts/${id}`, postData);
    return response.data;
  },

  // Delete post
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(`/posts/${id}`);
    return response.data;
  },

  // Publish post
  publish: async (id: string) => {
    const response = await apiClient.post<ApiResponse>(`/posts/${id}/publish`);
    return response.data;
  },

  // Unpublish post
  unpublish: async (id: string) => {
    const response = await apiClient.post<ApiResponse>(`/posts/${id}/unpublish`);
    return response.data;
  },
};