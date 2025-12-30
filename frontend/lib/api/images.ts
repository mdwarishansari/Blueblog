// frontend/lib/api/images.ts
import apiClient from './client'
import { Image, ApiResponse } from '@/types'

export const imageApi = {
  upload: async (formData: FormData): Promise<Image> => {
    const res = await apiClient.post<ApiResponse<{ image: Image }>>(
      '/images/upload',
      formData
    )

    if (!res.data.data) {
      throw new Error('Image upload failed')
    }

    return res.data.data.image
  },

  getAll: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get<ApiResponse<{
      images: Image[]
      pagination: any
    }>>('/images', { params })

    if (!res.data.data) {
      throw new Error('Failed to fetch images')
    }

    return res.data.data
  },

  getById: async (id: string): Promise<Image> => {
    const res = await apiClient.get<ApiResponse<{ image: Image }>>(`/images/${id}`)

    if (!res.data.data) {
      throw new Error('Image not found')
    }

    return res.data.data.image
  },

  update: async (id: string, imageData: Partial<Image>): Promise<Image> => {
    const res = await apiClient.put<ApiResponse<{ image: Image }>>(
      `/images/${id}`,
      imageData
    )

    if (!res.data.data) {
      throw new Error('Image update failed')
    }

    return res.data.data.image
  },

  delete: async (id: string) => {
    await apiClient.delete(`/images/${id}`)
  },
}
