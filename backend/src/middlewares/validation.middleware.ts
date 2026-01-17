import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        })
      }
      next(error)
    }
  }
}

// Validation schemas
export const schemas = {
  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
  }),

  createPost: z.object({
    body: z.object({
      title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
      excerpt: z.string().max(500, 'Excerpt too long').optional(),
      content: z.any(),
      categoryIds: z.array(z.string().uuid()).min(1, 'At least one category is required'),
      bannerImageId: z.string().uuid().optional(),
      status: z.enum(['DRAFT', 'PUBLISHED']),
      seoTitle: z.string().max(200, 'SEO title too long').optional(),
      seoDescription: z.string().max(500, 'SEO description too long').optional(),
      canonicalUrl: z.string().url('Invalid URL').optional(),
    }),
  }),

  updatePost: z.object({
    body: z.object({
      title: z.string().min(1).max(200).optional(),
      excerpt: z.string().max(500).optional(),
      content: z.any().optional(),
      categoryIds: z.array(z.string().uuid()).optional(),
      bannerImageId: z.string().uuid().optional(),
      status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
      seoTitle: z.string().max(200).optional(),
      seoDescription: z.string().max(500).optional(),
      canonicalUrl: z.string().url().optional(),
    }),
    params: z.object({
      id: z.string().uuid('Invalid post ID'),
    }),
  }),

  createCategory: z.object({
    body: z.object({
      name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
      slug: z.string().min(1, 'Slug is required').max(100, 'Slug too long'),
      imageId: z.string().uuid().optional(),
    }),
  }),

  contact: z.object({
    body: z.object({
      name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
      email: z.string().email('Invalid email format'),
      message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
    }),
  }),

  createUser: z.object({
    body: z.object({
      name: z.string().min(1, 'Name is required').max(100),
      email: z.string().email('Invalid email format'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      role: z.enum(['ADMIN', 'EDITOR', 'WRITER']),
      bio: z.string().max(500).optional(),
    }),
  }),
}