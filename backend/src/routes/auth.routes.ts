import { Router } from 'express'
import authController from '../controllers/auth.controller'
import { validate } from '../utils/validation'
import { schemas } from '../utils/validation'
import { authLimiter } from '../middlewares/rateLimit.middleware'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Authentication routes
router.post(
  '/login',
  authLimiter,
  validate(schemas.login),
  authController.login
)

// routes/auth.routes.ts
router.post('/logout', (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  res.json({
    success: true,
    message: 'Logged out successfully',
  })
})

router.post('/refresh', authController.refresh)

router.get('/me', authenticate, authController.me)

router.post(
  '/change-password',
  validate(schemas.changePassword),
  authController.changePassword
)

export default router