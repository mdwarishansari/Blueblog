import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import prisma from '../utils/prisma'
import { AppError } from './error.middleware'

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.access_token ||
      req.headers.authorization?.split(' ')[1]

    if (!token) {
      return next(new AppError('Authentication required', 401))
    }

    const decoded = verifyAccessToken(token) as { userId: string }

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
      return next(new AppError('User not found', 401))
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    }

    return next()
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401))
    }

    return next(new AppError('Invalid token', 401))
  }
}
