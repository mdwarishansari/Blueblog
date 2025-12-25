import { z } from 'zod'

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Post validation
export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug is too long'),
  excerpt: z.string().max(300, 'Excerpt is too long').optional(),
  content: z.any().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  seo_title: z.string().max(70, 'SEO title is too long').optional(),
  seo_description: z.string().max(160, 'SEO description is too long').optional(),
  canonical_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  banner_image_id: z.string().optional(),
  category_ids: z.array(z.string()).optional(),
})

export type PostFormData = z.infer<typeof postSchema>

// Category validation
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug is too long'),
})

export type CategoryFormData = z.infer<typeof categorySchema>

// Image validation
export const imageSchema = z.object({
  alt_text: z.string().min(1, 'Alt text is required').max(125, 'Alt text is too long'),
  title: z.string().max(100, 'Title is too long').optional(),
  caption: z.string().max(200, 'Caption is too long').optional(),
})

export type ImageFormData = z.infer<typeof imageSchema>

// User validation
export const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'EDITOR', 'WRITER']),
  bio: z.string().max(500, 'Bio is too long').optional(),
})

export type UserFormData = z.infer<typeof userSchema>

// Utility functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getFormErrors<T>(schema: z.ZodSchema<T>, data: any): Record<string, string> {
  try {
    schema.parse(data)
    return {}
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message
        }
      })
      return errors
    }
    return { _form: 'An unexpected error occurred' }
  }
}