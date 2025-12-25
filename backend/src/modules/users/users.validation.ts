import { z } from 'zod';

const userRoles = ['ADMIN', 'EDITOR', 'WRITER'] as const;

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(userRoles).optional().default('WRITER'),
    bio: z.string().optional(),
    profileImage: z.string().url('Invalid URL').optional().or(z.literal(''))
  })
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID')
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    role: z.enum(userRoles).optional(),
    bio: z.string().optional(),
    profileImage: z.string().url('Invalid URL').optional().or(z.literal(''))
  })
});

export const getUsersSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => parseInt(val || '1')),
    limit: z.string().optional().transform(val => parseInt(val || '12')),
    search: z.string().optional(),
    role: z.enum(userRoles).optional()
  })
});