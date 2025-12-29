import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/appError';

export class PostsService {
  async createPost(data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: any;
    bannerImageId?: string;
    categoryIds?: string[];
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    authorId: string;
    publishedAt?: string;
  }) {
    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: data.slug }
    });

    if (existingPost) {
      throw new ConflictError('Post with this slug already exists');
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        bannerImageId: data.bannerImageId,
        authorId: data.authorId,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        canonicalUrl: data.canonicalUrl,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        categories: data.categoryIds ? {
          connect: data.categoryIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        bannerImage: true,
        categories: true
      }
    });

    return post;
  }

  async getPosts(filters: {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  author?: string;
  status?: string;
  sort?: string;
  user?: {
    id: string;
    role: 'ADMIN' | 'EDITOR' | 'WRITER';
  };
}) {
    const { page, limit, search, category, author, status, sort } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    const isAdmin = filters.user?.role === 'ADMIN' || filters.user?.role === 'EDITOR';
const isWriter = filters.user?.role === 'WRITER';

// 🔥 STATUS FILTER — FIXED
if (filters.status && filters.status !== 'ALL') {
  // Explicit filter
  where.status = filters.status;
} else {
  // ALL status
  if (isAdmin) {
    // Admin & Editor → see everything (NO status filter)
    // do nothing
  } else if (filters.user?.role === 'WRITER') {
  where.authorId = filters.user.id;

    // Writer → published + own drafts
    where.OR = [
      { status: 'PUBLISHED' },
      { status: 'DRAFT', authorId: filters.user!.id }
    ];
  } else {
    // Public
    where.status = 'PUBLISHED';
  }
}


    
    if (search) {
  const searchConditions = [
    { title: { contains: search, mode: 'insensitive' } },
    { excerpt: { contains: search, mode: 'insensitive' } },
    { content: { path: ['content'], string_contains: search } }
  ];

  if (where.OR) {
    // 🔥 merge with existing OR (status logic)
    where.AND = [
      { OR: where.OR },
      { OR: searchConditions }
    ];
    delete where.OR;
  } else {
    where.OR = searchConditions;
  }
}

    
    if (category) {
      where.categories = {
        some: { slug: category }
      };
    }
    
    if (author) {
      where.author = { slug: author };
    }

    // Parse sort
    // ✅ SAFE SORT PARSING
const sortParam = typeof sort === 'string' ? sort : 'createdAt:desc'
const [sortField, sortOrder] = sortParam.split(':')

const orderBy = {
  [sortField]: sortOrder === 'desc' ? 'desc' : 'asc',
}


    // Get total count
    const total = await prisma.post.count({ where });

    // Get posts
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        bannerImage: true,
        categories: true
      },
      skip,
      take: limit,
      orderBy
    });

    const totalPages = Math.ceil(total / limit);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async getPostById(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            bio: true
          }
        },
        bannerImage: true,
        categories: true
      }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    return post;
  }

  async getPostBySlug(slug: string) {
    const post = await prisma.post.findUnique({
      where: { slug, status: 'PUBLISHED' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            bio: true
          }
        },
        bannerImage: true,
        categories: true
      }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    return post;
  }

  async updatePost(id: string, data: any, userId: string, userRole: string) {
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    // Check permissions (only author, editor, or admin can update)
    if (post.authorId !== userId && userRole === 'WRITER') {
      throw new Error('You can only update your own posts');
    }

    // Check if new slug is available
    // ✅ Check slug ONLY if it actually changed
if (data.slug && data.slug !== post.slug) {
  const existingSlug = await prisma.post.findUnique({
    where: { slug: data.slug }
  });

  if (existingSlug) {
    throw new ConflictError('Post with this slug already exists');
  }
}

    // Prepare update data
    const updateData: any = { ...data };
    
    // Handle categories
    if (data.categoryIds) {
      updateData.categories = {
        set: data.categoryIds.map((id: string) => ({ id }))
      };
      delete updateData.categoryIds;
    }
    
    // Handle publishedAt
    if (data.publishedAt) {
      updateData.publishedAt = new Date(data.publishedAt);
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        bannerImage: true,
        categories: true
      }
    });

    return updatedPost;
  }

  async deletePost(id: string) {
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    // Delete post
    await prisma.post.delete({
      where: { id }
    });

    return { message: 'Post deleted successfully' };
  }

  async publishPost(id: string, publishedAt?: string) {
    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: publishedAt ? new Date(publishedAt) : new Date()
      }
    });

    return updatedPost;
  }

  async unpublishPost(id: string) {
    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: 'DRAFT',
        publishedAt: null
      }
    });

    return updatedPost;
  }

  async getRelatedPosts(postId: string, limit = 5) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { categories: true }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    const categoryIds = post.categories.map(cat => cat.id);

    const relatedPosts = await prisma.post.findMany({
      where: {
        id: { not: postId },
        status: 'PUBLISHED',
        categories: {
          some: {
            id: { in: categoryIds }
          }
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        categories: true
      },
      take: limit,
      orderBy: { publishedAt: 'desc' }
    });

    return relatedPosts;
  }
  
}