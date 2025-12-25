import { Router } from 'express';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} from './users.controller';
import { validate } from '../../middleware/validate.middleware';
import {
  createUserSchema,
  updateUserSchema,
  getUsersSchema
} from './users.validation';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { createRateLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Only ADMIN can create, update, delete users
router.post('/', authorize('ADMIN'), createRateLimiter, validate(createUserSchema), createUser);
router.get('/', authorize('ADMIN', 'EDITOR'), validate(getUsersSchema), getUsers);
router.get('/:id', authorize('ADMIN', 'EDITOR'), getUser);
router.put('/:id', authorize('ADMIN'), validate(updateUserSchema), updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;