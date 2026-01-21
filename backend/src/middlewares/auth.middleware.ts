import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import prisma from '../utils/prisma'

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookie or header
    const token =
      req.cookies?.access_token ||
      req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    // Verify token
    const decoded = verifyAccessToken(token) as { userId: string }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    }

    return next()
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      })
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
  }
}
