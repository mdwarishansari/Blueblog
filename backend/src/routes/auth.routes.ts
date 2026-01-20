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

router.post('/logout', authController.logout)
router.post('/refresh', authController.refresh)

router.get('/me', authenticate, authController.me)

router.post(
  '/change-password',
  validate(schemas.changePassword),
  authController.changePassword
)

export default router