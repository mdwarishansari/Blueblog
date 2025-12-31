import apiClient from './client'
import { Image } from '@/types'

export const imageApi = {
  upload: async (formData: FormData): Promise<Image> => {
    const res = await apiClient.post('/images/upload', formData)

    // res = { status, data }
    return res.data.data?.image ?? res.data.image

  },

  getAll: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get('/images', { params })
    return res.data
  },

  getById: async (id: string): Promise<Image> => {
    const res = await apiClient.get(`/images/${id}`)
    return res.data.image
  },

  update: async (id: string, imageData: Partial<Image>): Promise<Image> => {
    const res = await apiClient.put(`/images/${id}`, imageData)
    return res.data.image
  },

  delete: async (id: string) => {
    await apiClient.delete(`/images/${id}`)
  },
}
