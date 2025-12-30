// frontend/lib/api/auth.ts
import apiClient from './client'
import { User } from '@/types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const res = await apiClient.post('/auth/login', credentials)
    return res.data
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me')
    return res.data.user
  },

  logout: async (refreshToken: string) => {
    await apiClient.post('/auth/logout', { refreshToken })
  },

  refreshToken: async (refreshToken: string) => {
    const res = await apiClient.post('/auth/refresh', { refreshToken })
    return res.data
  },

  changePassword: async (data: {
    currentPassword: string
    newPassword: string
  }) => {
    await apiClient.post('/auth/change-password', data)
  },
}
