import { Request, Response, NextFunction } from 'express'
import postsService from '../services/posts.service'
import { generateSlug } from '../utils/validation'
import { PostStatus } from '@prisma/client'

export class PostsController {
  // ============================
  // GET POSTS (ADMIN / DASHBOARD)
  // ============================
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

      // ✅ allow ALL PostStatus values
      const parsedStatus =
        typeof status === 'string' &&
        Object.values(PostStatus).includes(status as PostStatus)
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

  // ============================
  // GET POST BY SLUG (PUBLIC)
  // ============================
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

  // ============================
  // GET POST BY ID (ADMIN)
  // ============================
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

  // ============================
  // CREATE POST (ALL ROLES)
  // ============================
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
      status,
      scheduledAt,
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
      scheduledAt,
      seoTitle,
      seoDescription,
      canonicalUrl,
      userRole: req.user.role,
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

  // ============================
  // UPDATE POST (CONTENT ONLY)
  // ============================
  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const id = String(req.params.id)

      // ❌ status must NEVER come from req.body
      const {
        status, // discard if sent
        publishedAt,
        approvedAt,
        approvedBy,
        ...safeUpdateData
      } = req.body

      const post = await postsService.updatePost(
        id,
        safeUpdateData,
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

  // ============================
  // DELETE POST
  // ============================
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

  // ============================
  // WORKFLOW ACTIONS
  // ============================

  async requestVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await postsService.requestVerification(
        req.params.id,
        req.user
      )

      res.json({ success: true, data: post })
    } catch (error) {
      next(error)
    }
  }

  async approvePost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await postsService.approvePost(
        req.params.id,
        req.user
      )

      res.json({ success: true, data: post })
    } catch (error) {
      next(error)
    }
  }

  async rejectPost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await postsService.rejectPost(
        req.params.id,
        req.user
      )

      res.json({ success: true, data: post })
    } catch (error) {
      next(error)
    }
  }
}

export default new PostsController()
