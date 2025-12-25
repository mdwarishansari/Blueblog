import apiClient from './client';
import { Image, ApiResponse } from '@/types';

export const imageApi = {
  // Upload image
  upload: async (formData: FormData) => {
    const response = await apiClient.post<ApiResponse<Image>>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all images
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get<ApiResponse<Image[]>>('/images', { params });
    return response.data;
  },

  // Get image by ID
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Image>>(`/images/${id}`);
    return response.data;
  },

  // Update image
  update: async (id: string, imageData: Partial<Image>) => {
    const response = await apiClient.put<ApiResponse<Image>>(`/images/${id}`, imageData);
    return response.data;
  },

  // Delete image
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(`/images/${id}`);
    return response.data;
  },
};