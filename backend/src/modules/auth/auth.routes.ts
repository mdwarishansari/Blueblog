import { Router } from 'express';
import {
  login,
  refreshToken,
  logout,
  getCurrentUser,
  changePassword,
  logoutAll
} from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema
} from './auth.validation';
import { authenticate } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);
router.post('/logout', validate(refreshTokenSchema), logout);

// Protected routes
router.use(authenticate);
router.get('/me', getCurrentUser);
router.post('/change-password', validate(changePasswordSchema), changePassword);
router.post('/logout-all', logoutAll);

export default router;