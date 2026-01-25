import prisma from '../utils/prisma'
import { AppError } from '../middlewares/error.middleware'
import { PostStatus, UserRole } from '@prisma/client'

export interface CreatePostData {
  title: string
  slug?: string
  excerpt?: string
  content: any
  authorId: string
  categoryIds: string[]
  bannerImageId?: string
  status?: PostStatus
  scheduledAt?: string
  seoTitle?: string
  seoDescription?: string
  canonicalUrl?: string
  userRole: UserRole
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
  /* =========================
     CREATE POST (ALWAYS DRAFT)
     ========================= */
  async createPost(data: CreatePostData) {
  const slug = data.slug || this.generateSlug(data.title)

  const existingPost = await prisma.post.findUnique({
    where: { slug },
  })

  if (existingPost) {
    throw new AppError('Post with this slug already exists', 409)
  }

  // 🔐 ROLE-BASED STATUS DECISION
  let status: PostStatus = PostStatus.DRAFT
  let publishedAt: Date | null = null
  let scheduledAt: Date | null = null

  if (data.userRole === 'ADMIN' || data.userRole === 'EDITOR') {
    if (data.status === PostStatus.SCHEDULED && data.scheduledAt) {
      status = PostStatus.SCHEDULED
      scheduledAt = new Date(data.scheduledAt)
    } else if (data.status === PostStatus.PUBLISHED) {
      status = PostStatus.PUBLISHED
      publishedAt = new Date()
    }
  }

  if (data.userRole === 'WRITER' && data.status === PostStatus.VERIFICATION_PENDING) {
    status = PostStatus.VERIFICATION_PENDING
  }

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      authorId: data.authorId,
      bannerImageId: data.bannerImageId,
      status,
      publishedAt,
      scheduledAt,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      canonicalUrl: data.canonicalUrl,
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


  /* =========================
     UPDATE POST (NO STATUS)
     ========================= */
  async updatePost(
    id: string,
    data: UpdatePostData,
    userId: string,
    userRole: UserRole
  ) {
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      throw new AppError('Post not found', 404)
    }

    if (userRole === 'WRITER' && existingPost.authorId !== userId) {
      throw new AppError('You can only update your own posts', 403)
    }

    if (data.slug && data.slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug: data.slug },
      })
      if (slugExists) {
        throw new AppError('Post with this slug already exists', 409)
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        bannerImageId: data.bannerImageId,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        canonicalUrl: data.canonicalUrl,
        categories: data.categoryIds
          ? { set: data.categoryIds.map(id => ({ id })) }
          : undefined,
        // 🚫 status & publishedAt intentionally NOT touched
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

  /* =========================
     DELETE POST
     ========================= */
  async deletePost(id: string, userId: string, userRole: UserRole) {
    const post = await prisma.post.findUnique({
      where: { id },
    })

    if (!post) {
      throw new AppError('Post not found', 404)
    }

    if (userRole === 'WRITER' && post.authorId !== userId) {
      throw new AppError('You can only delete your own posts', 403)
    }

    await prisma.post.delete({
      where: { id },
    })

    return { message: 'Post deleted successfully' }
  }

  /* =========================
     PUBLIC POST (ONLY LIVE)
     ========================= */
  async getPostBySlug(slug: string) {
    const post = await prisma.post.findUnique({
      where: {
        slug,
        status: PostStatus.PUBLISHED,
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

  /* =========================
     ADMIN / DASHBOARD LIST
     ========================= */
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
    const where: any = {}

    // ✅ allow ALL PostStatus values
    if (status && Object.values(PostStatus).includes(status)) {
      where.status = status
    }

    if (category) {
      where.categories = {
        some: { slug: category },
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (authorId) {
      where.authorId = authorId
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    if (sort === 'popular') orderBy = { publishedAt: 'desc' }

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

  /* =========================
     GET POST BY ID
     ========================= */
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

  /* =========================
     UTIL
     ========================= */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim()
  }
}

export default new PostsService()
