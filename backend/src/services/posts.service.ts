import prisma from '../utils/prisma'
import { AppError } from '../middlewares/error.middleware'
import { PostStatus } from '@prisma/client'

export interface CreatePostData {
  title: string
  slug?: string
  excerpt?: string
  content: any
  authorId: string
  categoryIds: string[]
  bannerImageId?: string
  status: PostStatus
  seoTitle?: string
  seoDescription?: string
  canonicalUrl?: string
}

export interface UpdatePostData extends Partial<CreatePostData> {}

export interface GetPostsFilters {
  page?: number
  pageSize?: number
  category?: string
  search?: string
  authorId?: string
  status?: PostStatus
  sort?: 'newest' | 'oldest' | 'popular'
}

export class PostsService {
  async createPost(data: CreatePostData) {
    // Generate slug from title if not provided
    const slug = data.slug || this.generateSlug(data.title)

    // Check if slug exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    })

    if (existingPost) {
      throw new AppError('Post with this slug already exists', 409)
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        authorId: data.authorId,
        bannerImageId: data.bannerImageId,
        status: data.status,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        canonicalUrl: data.canonicalUrl,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        categories: {
          connect: data.categoryIds.map(id => ({ id })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bannerImage: true,
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
      },
    })

    return post
  }

  async updatePost(id: string, data: UpdatePostData, userId: string, userRole: string) {
    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    })

    if (!existingPost) {
      throw new AppError('Post not found', 404)
    }

    // Check permission (writers can only update their own posts)
    if (userRole === 'WRITER' && existingPost.authorId !== userId) {
      throw new AppError('You can only update your own posts', 403)
    }

    // If slug is being updated, check uniqueness
    if (data.slug && data.slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug: data.slug },
      })
      if (slugExists) {
        throw new AppError('Post with this slug already exists', 409)
      }
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        bannerImageId: data.bannerImageId,
        status: data.status,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        canonicalUrl: data.canonicalUrl,
        publishedAt: data.status === 'PUBLISHED' && existingPost.status === 'DRAFT' 
          ? new Date() 
          : existingPost.publishedAt,
        categories: data.categoryIds 
          ? { set: data.categoryIds.map(id => ({ id })) }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bannerImage: true,
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
      },
    })

    return updatedPost
  }

  async deletePost(id: string, userId: string, userRole: string) {
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    })

    if (!post) {
      throw new AppError('Post not found', 404)
    }

    // Check permission
    if (userRole === 'WRITER' && post.authorId !== userId) {
      throw new AppError('You can only delete your own posts', 403)
    }

    // Delete post
    await prisma.post.delete({
      where: { id },
    })

    return { message: 'Post deleted successfully' }
  }

  async getPostBySlug(slug: string) {
    const post = await prisma.post.findUnique({
      where: { 
        slug,
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            profileImage: true,
          },
        },
        bannerImage: true,
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
      },
    })

    if (!post) {
      throw new AppError('Post not found', 404)
    }

    return post
  }

  async getPosts(filters: GetPostsFilters = {}) {
    const {
      page = 1,
      pageSize = 10,
      category,
      search,
      authorId,
      status,
      sort = 'newest',
    } = filters

    const skip = (page - 1) * pageSize

    // Build where clause
    const where: any = {}

    // Only show published posts for public endpoints
    // ✅ Admin: apply status filter ONLY if explicitly requested
if (status === 'DRAFT' || status === 'PUBLISHED') {
  where.status = status
}


    if (category) {
      where.categories = {
        some: {
          slug: category,
        },
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        // You can also search in content if needed
      ]
    }

    if (authorId) {
      where.authorId = authorId
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' }
    } else if (sort === 'popular') {
      // You might want to add a views field to track popularity
      orderBy = { publishedAt: 'desc' }
    }

    // Get posts and total count
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          bannerImage: true,
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ])

    return {
      data: posts,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  async getPostById(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            profileImage: true,
          },
        },
        bannerImage: true,
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
      },
    })

    if (!post) {
      throw new AppError('Post not found', 404)
    }

    return post
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
  }
}

export default new PostsService()