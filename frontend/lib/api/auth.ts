import apiClient from './client';
import { LoginCredentials, AuthTokens, User, ApiResponse } from '@/types';

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post<ApiResponse>('/auth/logout');
    return response.data;
  },

  // Change password
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.post<ApiResponse>('/auth/change-password', data);
    return response.data;
  },
};