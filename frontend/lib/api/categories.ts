import apiClient from './client';
import { Category, ApiResponse } from '@/types';

export const categoryApi = {
  // Get all categories
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  // Get category by slug
  getBySlug: async (slug: string) => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
    return response.data;
  },

  // Get posts by category slug
  getPostsBySlug: async (slug: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get<ApiResponse>(`/categories/${slug}/posts`, { params });
    return response.data;
  },

  // Create category (admin only)
  create: async (categoryData: { name: string; slug: string }) => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', categoryData);
    return response.data;
  },

  // Update category (admin only)
  update: async (id: string, categoryData: Partial<Category>) => {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category (admin only)
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(`/categories/${id}`);
    return response.data;
  },
};