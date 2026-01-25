export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'EDITOR' | 'WRITER'
  bio?: string
  profileImage?: string
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: any // JSON content
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt?: Date
  bannerImage?: Image
  categories: Category[]
  author: User
  seoTitle?: string
  seoDescription?: string
  canonicalUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  image?: Image
  posts?: Post[]
}

export interface Image {
  id: string
  url: string
  altText?: string
  title?: string
  caption?: string
  width?: number
  height?: number
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  isRead: boolean
  createdAt: Date
}

export interface Settings {
  siteName: string
  siteUrl: string
  description: string
  social?: {
    twitter?: string
    facebook?: string
    instagram?: string
    linkedin?: string
    github?: string
  }
  footerHtml?: string
  contactEmail?: string
}

// Request types
export interface LoginRequest {
  email: string
  password: string
}

export interface CreatePostRequest {
  title: string
  excerpt?: string
  content: any
  categoryIds: string[]
  bannerImageId?: string
  status: 'DRAFT' | 'PUBLISHED'
  seoTitle?: string
  seoDescription?: string
  canonicalUrl?: string
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {}

export interface CreateCategoryRequest {
  name: string
  slug: string
  imageId?: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'EDITOR' | 'WRITER'
  bio?: string
}

// Extend Express Request
import { UserRole } from '@prisma/client'

declare global {
  namespace Express {
    interface User {
      id: string
      email: string
      role: UserRole
    }

    interface Request {
      user?: User
    }
  }
}
