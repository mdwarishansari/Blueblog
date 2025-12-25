import apiClient from './client';
import { Post, ApiResponse } from '@/types';

export const postApi = {
  // Get all posts (public)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    author?: string;
    status?: string;
    sort?: string;
  }) => {
    const response = await apiClient.get<ApiResponse<Post[]>>('/posts', { params });
    return response.data;
  },

  // Get single post by slug (public)
  getBySlug: async (slug: string) => {
    const response = await apiClient.get<ApiResponse<Post>>(`/posts/slug/${slug}`);
    return response.data;
  },

  // Create post (admin/writer)
  create: async (postData: Partial<Post>) => {
    const response = await apiClient.post<ApiResponse<Post>>('/posts', postData);
    return response.data;
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