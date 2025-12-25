import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/appError';

export class CategoriesService {
  async createCategory(data: { name: string; slug: string }) {
    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: data.slug }
    });

    if (existingCategory) {
      throw new ConflictError('Category with this slug already exists');
    }

    const category = await prisma.category.create({
      data
    });

    return category;
  }

  async getCategories(filters: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const { page, limit, search } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prisma.category.count({ where });

    // Get categories
    const categories = await prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    const totalPages = Math.ceil(total / limit);

    return {
      categories,
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

  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug }
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    return category;
  }

  async updateCategory(id: string, data: { name?: string; slug?: string }) {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    // Check if new slug is available
    if (data.slug && data.slug !== category.slug) {
      const existingSlug = await prisma.category.findUnique({
        where: { slug: data.slug }
      });
      
      if (existingSlug) {
        throw new ConflictError('Category with this slug already exists');
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data
    });

    return updatedCategory;
  }

  async deleteCategory(id: string) {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    // Check if category has posts
    const postsCount = await prisma.post.count({
      where: { categories: { some: { id } } }
    });

    if (postsCount > 0) {
      throw new Error('Cannot delete category with existing posts');
    }

    // Delete category
    await prisma.category.delete({
      where: { id }
    });

    return { message: 'Category deleted successfully' };
  }

  async getCategoryPosts(slug: string, page: number, limit: number) {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { slug }
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.post.count({
      where: {
        categories: { some: { slug } },
        status: 'PUBLISHED'
      }
    });

    // Get posts
    const posts = await prisma.post.findMany({
      where: {
        categories: { some: { slug } },
        status: 'PUBLISHED'
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
      },
      skip,
      take: limit,
      orderBy: { publishedAt: 'desc' }
    });

    const totalPages = Math.ceil(total / limit);

    return {
      posts,
      category,
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
}