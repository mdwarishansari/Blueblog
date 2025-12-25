import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategory,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getCategoryPosts
} from './categories.controller';
import { validate } from '../../middleware/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoriesSchema
} from './categories.validation';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { createRateLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();

// Public routes
router.get('/', validate(getCategoriesSchema), getCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:slug/posts', getCategoryPosts);

// Protected routes (ADMIN only for write operations)
router.use(authenticate);
router.post('/', authorize('ADMIN'), createRateLimiter, validate(createCategorySchema), createCategory);
router.get('/:id', authorize('ADMIN', 'EDITOR'), getCategory);
router.put('/:id', authorize('ADMIN'), validate(updateCategorySchema), updateCategory);
router.delete('/:id', authorize('ADMIN'), deleteCategory);

export default router;