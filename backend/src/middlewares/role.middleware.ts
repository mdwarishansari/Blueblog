import { Request, Response, NextFunction } from 'express'

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      })
    }

    next()
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
      let resource
      const resourceId = req.params.id

      if (model === 'post') {
        resource = await prisma.post.findUnique({
          where: { id: resourceId },
          select: { authorId: true },
        })
      } else if (model === 'user') {
        // Users can only access their own profile
        resource = { id: resourceId }
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        })
      }

      // Check if user owns the resource
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

      next()
    } catch (error) {
      next(error)
    }
  }
}