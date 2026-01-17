import { Request, Response, NextFunction } from 'express'
import categoriesService from '../services/categories.service'
import { generateSlug } from '../utils/validation'

export class CategoriesController {
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoriesService.getAllCategories()

      res.json({
        success: true,
        data: categories,
      })
    } catch (error) {
      next(error)
    }
  }

  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params

      const category = await categoriesService.getCategoryBySlug(slug)

      res.json({
        success: true,
        data: category,
      })
    } catch (error) {
      next(error)
    }
  }

  async getCategoryPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params
      const { page = 1, pageSize = 10 } = req.query

      const result = await categoriesService.getCategoryPosts(
        slug,
        Number(page),
        Number(pageSize)
      )

      res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      })
    } catch (error) {
      next(error)
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

      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully',
      })
    } catch (error) {
      next(error)
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

      const { id } = req.params
      const updateData = req.body

      const category = await categoriesService.updateCategory(id, updateData)

      res.json({
        success: true,
        data: category,
        message: 'Category updated successfully',
      })
    } catch (error) {
      next(error)
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

      const { id } = req.params

      const result = await categoriesService.deleteCategory(id)

      res.json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      next(error)
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

      res.json({
        success: true,
        data: categories,
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new CategoriesController()