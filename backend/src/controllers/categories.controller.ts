import { Request, Response, NextFunction } from 'express'
import categoriesService from '../services/categories.service'
import { generateSlug } from '../utils/validation'

export class CategoriesController {
  async getAllCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoriesService.getAllCategories()

      return res.json({
        success: true,
        data: categories,
      })
    } catch (error) {
      return next(error)
    }
  }

  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = String(req.params.slug)

      const category = await categoriesService.getCategoryBySlug(slug)

      return res.json({
        success: true,
        data: category,
      })
    } catch (error) {
      return next(error)
    }
  }

  async getCategoryPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = String(req.params.slug)
      const page = Number(req.query.page ?? 1)
      const pageSize = Number(req.query.pageSize ?? 10)

      const result = await categoriesService.getCategoryPosts(
        slug,
        page,
        pageSize
      )

      return res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      })
    } catch (error) {
      return next(error)
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const { name, imageId } = req.body
      const slug = generateSlug(name)

      const category = await categoriesService.createCategory(name, slug, imageId)

      return res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully',
      })
    } catch (error) {
      return next(error)
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const id = String(req.params.id)
      const updateData = req.body

      const category = await categoriesService.updateCategory(id, updateData)

      return res.json({
        success: true,
        data: category,
        message: 'Category updated successfully',
      })
    } catch (error) {
      return next(error)
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const id = String(req.params.id)

      const result = await categoriesService.deleteCategory(id)

      return res.json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      return next(error)
    }
  }

  async getAdminCategories(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const categories = await categoriesService.getCategoriesForAdmin()

      return res.json({
        success: true,
        data: categories,
      })
    } catch (error) {
      return next(error)
    }
  }
}

export default new CategoriesController()
