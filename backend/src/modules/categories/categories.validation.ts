import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z.string()
      .min(2, 'Slug must be at least 2 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  })
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID')
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    slug: z.string()
      .min(2, 'Slug must be at least 2 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
      .optional()
  })
});

export const getCategoriesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => parseInt(val || '1')),
    limit: z.string().optional().transform(val => parseInt(val || '12')),
    search: z.string().optional()
  })
});