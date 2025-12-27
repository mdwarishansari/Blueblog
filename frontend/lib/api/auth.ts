// frontend/lib/api/auth.ts
import apiClient from './client'
import { ApiResponse, User } from '@/types'

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
  // LOGIN (ONLY ENTRY POINT)
  login: async (credentials: LoginCredentials) => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    )
    return res.data.data
  },

  // CURRENT USER
  getMe: async () => {
    const res = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me')
    return res.data.data.user
  },

  // LOGOUT (REQUIRES REFRESH TOKEN)
  logout: async (refreshToken: string) => {
    await apiClient.post('/auth/logout', { refreshToken })
  },

  // REFRESH TOKEN
  refreshToken: async (refreshToken: string) => {
    const res = await apiClient.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >('/auth/refresh', { refreshToken })

    return res.data.data
  },

  // CHANGE PASSWORD (AUTHENTICATED)
  changePassword: async (data: {
    currentPassword: string
    newPassword: string
  }) => {
    await apiClient.post('/auth/change-password', data)
  },
}
