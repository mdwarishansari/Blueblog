import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters')
  })
});