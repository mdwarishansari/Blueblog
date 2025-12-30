import apiClient from './client';
import { User, ApiResponse } from '@/types';

export const userApi = {
  getAll: async (params?: any) => {
  const res = await apiClient.get('/users', { params })
  return res.data.data as {
    users: User[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
},



  // Get user by ID
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  // Create user (admin only)
  create: async (userData: Partial<User>) => {
    const response = await apiClient.post<ApiResponse<User>>('/users', userData);
    return response.data;
  },

  // Update user
  update: async (id: string, userData: Partial<User>) => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user (admin only)
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(`/users/${id}`);
    return response.data;
  },

  // Get user's posts
  getUserPosts: async (userId: string, params?: { page?: number; limit?: number; status?: string }) => {
    const response = await apiClient.get<ApiResponse>(`/users/${userId}/posts`, { params });
    return response.data;
  },
};