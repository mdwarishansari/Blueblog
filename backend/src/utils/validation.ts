import { z } from 'zod'

// Common validation schemas
export const schemas = {
  // Auth
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),

  register: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    role: z.enum(['ADMIN', 'EDITOR', 'WRITER']).optional(),
  }),

  // Posts
  createPost: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    excerpt: z.string().max(500, 'Excerpt too long').optional(),
    content: z.any(),
    categoryIds: z.array(z.string().uuid()).min(1, 'At least one category is required'),
    bannerImageId: z.string().uuid('Invalid image ID').optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
    seoTitle: z.string().max(200, 'SEO title too long').optional(),
    seoDescription: z.string().max(500, 'SEO description too long').optional(),
    canonicalUrl: z.string().url('Invalid URL').optional(),
  }),

  updatePost: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
    excerpt: z.string().max(500, 'Excerpt too long').optional(),
    content: z.any().optional(),
    categoryIds: z.array(z.string().uuid()).optional(),
    bannerImageId: z.string().uuid('Invalid image ID').optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    seoTitle: z.string().max(200, 'SEO title too long').optional(),
    seoDescription: z.string().max(500, 'SEO description too long').optional(),
    canonicalUrl: z.string().url('Invalid URL').optional(),
  }),

  // Categories
  createCategory: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    slug: z.string()
      .min(1, 'Slug is required')
      .max(100, 'Slug too long')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    imageId: z.string().uuid('Invalid image ID').optional(),
  }),

  updateCategory: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
    slug: z.string()
      .min(1, 'Slug is required')
      .max(100, 'Slug too long')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
      .optional(),
    imageId: z.string().uuid('Invalid image ID').optional(),
  }),

  // Users
  createUser: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    role: z.enum(['ADMIN', 'EDITOR', 'WRITER']),
    bio: z.string().max(500, 'Bio too long').optional(),
    profileImage: z.string().url('Invalid URL').optional(),
  }),

  updateUser: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    email: z.string().email('Invalid email format').optional(),
    role: z.enum(['ADMIN', 'EDITOR', 'WRITER']).optional(),
    bio: z.string().max(500, 'Bio too long').optional(),
    profileImage: z.string().url('Invalid URL').optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  }),

  // Contact
  contact: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email format'),
    message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
  }),

  // Settings
  updateSettings: z.object({
    siteName: z.string().min(1, 'Site name is required').max(100),
    siteUrl: z.string().url('Invalid URL'),
    description: z.string().max(500, 'Description too long'),
    social: z.object({
      twitter: z.string().optional(),
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
      github: z.string().optional(),
    }).optional(),
    footerHtml: z.string().max(2000, 'Footer HTML too long').optional(),
    contactEmail: z.string().email('Invalid email').optional(),
  }),

  // Query params
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    pageSize: z.string().regex(/^\d+$/).transform(Number).default('10'),
  }),

  postsQuery: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    pageSize: z.string().regex(/^\d+$/).transform(Number).default('10'),
    category: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(['newest', 'oldest', 'popular']).default('newest'),
    authorId: z.string().uuid('Invalid author ID').optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  }),
}

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        })
      }
      next(error)
    }
  }
}

// Helper to generate slug
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

// Validate UUID
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}