import prisma from '../utils/prisma'
import { AppError } from '../middlewares/error.middleware'

export class CategoriesService {
  async getAllCategories(includePosts: boolean = false) {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        image: true,
        _count: {
          select: {
            posts: true,
          },
        },
        ...(includePosts && {
          posts: {
            where: { status: 'PUBLISHED' },
            take: 5,
            orderBy: { publishedAt: 'desc' },
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              publishedAt: true,
            },
          },
        }),
      },
    })

    return categories
  }

  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        image: true,
      },
    })

    if (!category) {
      throw new AppError('Category not found', 404)
    }

    return category
  }

  async getCategoryPosts(slug: string, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          categories: {
            some: { slug },
          },
        },
        skip,
        take: pageSize,
        orderBy: { publishedAt: 'desc' },
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
      prisma.post.count({
        where: {
          status: 'PUBLISHED',
          categories: {
            some: { slug },
          },
        },
      }),
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

  async createCategory(name: string, slug: string, imageId?: string) {
    // Check if slug exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      throw new AppError('Category with this slug already exists', 409)
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        imageId,
      },
      include: {
        image: true,
      },
    })

    return category
  }

  async updateCategory(id: string, data: { name?: string; slug?: string; imageId?: string }) {
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      throw new AppError('Category not found', 404)
    }

    // Check if new slug is unique
    if (data.slug && data.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: data.slug },
      })
      if (slugExists) {
        throw new AppError('Category with this slug already exists', 409)
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data,
      include: {
        image: true,
      },
    })

    return updatedCategory
  }

  async deleteCategory(id: string) {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        posts: {
          take: 1,
        },
      },
    })

    if (!category) {
      throw new AppError('Category not found', 404)
    }

    // Check if category has posts
    if (category.posts.length > 0) {
      throw new AppError('Cannot delete category that has posts', 400)
    }

    await prisma.category.delete({
      where: { id },
    })

    return { message: 'Category deleted successfully' }
  }

  async getCategoriesForAdmin() {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        image: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    })

    return categories
  }
}

export default new CategoriesService()