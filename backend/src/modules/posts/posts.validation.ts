import { z } from 'zod';

const postStatuses = ['DRAFT', 'PUBLISHED'] as const;

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    slug: z.string()
      .min(3, 'Slug must be at least 3 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
    content: z.any(), // JSON content from editor
    bannerImageId: z.string().uuid('Invalid image ID').optional(),
    categoryIds: z.array(z.string().uuid('Invalid category ID')).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().max(160, 'SEO description must be less than 160 characters').optional(),
    canonicalUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    publishedAt: z.string().datetime().optional()
  })
});

export const updatePostSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid post ID')
  }),
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').optional(),
    slug: z.string()
      .min(3, 'Slug must be at least 3 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
      .optional(),
    excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
    content: z.any().optional(),
    bannerImageId: z.string().uuid('Invalid image ID').optional(),
    categoryIds: z.array(z.string().uuid('Invalid category ID')).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().max(160, 'SEO description must be less than 160 characters').optional(),
    canonicalUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    status: z.enum(postStatuses).optional(),
    publishedAt: z.string().datetime().optional()
  })
});

export const getPostsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => parseInt(val || '1')),
    limit: z.string().optional().transform(val => parseInt(val || '12')),
    search: z.string().optional(),
    category: z.string().optional(),
    author: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ALL']).optional(),
    sort: z.string().optional().default('publishedAt:desc')
  })
});

export const publishPostSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({}).optional()
});
