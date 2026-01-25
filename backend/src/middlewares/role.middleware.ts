import { Request, Response, NextFunction } from 'express'
import { AppError } from './error.middleware'
import prisma from '../utils/prisma'

export const authorize = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401))
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403))
    }

    return next()
  }
}


export const checkOwnership = (model: 'post' | 'user') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    // Admins and editors can access any resource
    if (req.user.role === 'ADMIN' || req.user.role === 'EDITOR') {
      return next()
    }

    try {
      const resourceId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id

      let resource: { authorId?: string } | null = null // ✅ FIX 3

      if (model === 'post') {
        resource = await prisma.post.findUnique({
          where: { id: resourceId },
          select: { authorId: true },
        })
      }

      if (model === 'user') {
        // users can only access themselves
        resource = { authorId: resourceId }
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        })
      }

      if (model === 'post' && resource.authorId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only access your own posts',
        })
      }

      if (model === 'user' && resourceId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only access your own profile',
        })
      }

      return next() // ✅ FIX 2
    } catch (error) {
      return next(error) // ✅ FIX 2
    }
  }
}
