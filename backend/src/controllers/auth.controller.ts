import { Request, Response, NextFunction } from 'express'
import authService from '../services/auth.service'
import { AppError } from '../middlewares/error.middleware'

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body

      const result = await authService.login(email, password)

      // Set cookies
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })

      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })

      res.json({
        success: true,
        data: {
          user: result.user,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refresh_token

      if (refreshToken) {
        await authService.logout(refreshToken)
      }

      // Clear cookies
      res.clearCookie('access_token')
      res.clearCookie('refresh_token')

      res.json({
        success: true,
        message: 'Logged out successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refresh_token

      if (!refreshToken) {
        throw new AppError('Refresh token required', 400)
      }

      const result = await authService.refresh(refreshToken)

      // Set new access token cookie
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })

      res.json({
        success: true,
        data: {
          user: result.user,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401)
      }

      const user = await authService.getCurrentUser(req.user.id)

      res.json({
        success: true,
        data: {
          user,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401)
      }

      const { currentPassword, newPassword } = req.body

      await authService.changePassword(req.user.id, currentPassword, newPassword)

      res.json({
        success: true,
        message: 'Password changed successfully',
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new AuthController()