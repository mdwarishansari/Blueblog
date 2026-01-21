import { Request, Response, NextFunction } from 'express'
import postsService from '../services/posts.service'
import { generateSlug } from '../utils/validation'
import { PostStatus } from '@prisma/client'
export class PostsController {
  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = '1',
        pageSize = '10',
        category,
        search,
        sort = 'newest',
        authorId,
        status,
      } = req.query

      const parsedStatus =
  status === 'DRAFT' || status === 'PUBLISHED'
    ? (status as PostStatus)
    : undefined


      const filters = {
        page: Number(page),
        pageSize: Number(pageSize),
        category: typeof category === 'string' ? category : undefined,
        search: typeof search === 'string' ? search : undefined,
        sort:
  sort === 'oldest' || sort === 'popular' || sort === 'newest'
    ? (sort as 'newest' | 'oldest' | 'popular')
    : 'newest',

        authorId: typeof authorId === 'string' ? authorId : undefined,
        status: parsedStatus,
      }

      const result = await postsService.getPosts(filters)

      return res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      })
    } catch (error) {
      return next(error)
    }
  }

  async getPostBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = String(req.params.slug)

      const post = await postsService.getPostBySlug(slug)

      return res.json({
        success: true,
        data: post,
      })
    } catch (error) {
      return next(error)
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id)

      const post = await postsService.getPostById(id)

      return res.json({
        success: true,
        data: post,
      })
    } catch (error) {
      return next(error)
    }
  }

  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const {
        title,
        excerpt,
        content,
        categoryIds,
        bannerImageId,
        status = 'DRAFT',
        seoTitle,
        seoDescription,
        canonicalUrl,
      } = req.body

      const slug = generateSlug(title)

      const post = await postsService.createPost({
        title,
        slug,
        excerpt,
        content,
        authorId: req.user.id,
        categoryIds,
        bannerImageId,
        status,
        seoTitle,
        seoDescription,
        canonicalUrl,
      })

      return res.status(201).json({
        success: true,
        data: post,
        message: 'Post created successfully',
      })
    } catch (error) {
      return next(error)
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const id = String(req.params.id)
      const updateData = req.body

      const post = await postsService.updatePost(
        id,
        updateData,
        req.user.id,
        req.user.role
      )

      return res.json({
        success: true,
        data: post,
        message: 'Post updated successfully',
      })
    } catch (error) {
      return next(error)
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const id = String(req.params.id)

      const result = await postsService.deletePost(
        id,
        req.user.id,
        req.user.role
      )

      return res.json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      return next(error)
    }
  }
}

export default new PostsController()
