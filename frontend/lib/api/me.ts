import apiClient from './client';

export const meApi = {
  updateProfile: (data: {
    name?: string;
    bio?: string;
    profileImage?: string;
  }) => apiClient.put('/me/profile', data),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => apiClient.put('/me/password', data),
};
