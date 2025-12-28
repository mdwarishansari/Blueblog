import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPost,
  getPostBySlug,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
  getRelatedPosts
} from './posts.controller';
import { validate } from '../../middleware/validate.middleware';
import {
  createPostSchema,
  updatePostSchema,
  getPostsSchema,
  publishPostSchema
} from './posts.validation';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { createRateLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();

// 🔓 PUBLIC
router.get('/public', validate(getPostsSchema), getPosts);
router.get('/slug/:slug', getPostBySlug);
router.get('/:id/related', getRelatedPosts);

// 🔒 EVERYTHING BELOW REQUIRES AUTH
router.use(authenticate);

// 🔒 ADMIN / DASHBOARD
router.get('/', validate(getPostsSchema), getPosts);
router.get('/:id', getPost);

// Mutations
router.post('/', authorize('WRITER', 'EDITOR', 'ADMIN'), validate(createPostSchema), createPost);
router.put('/:id', authorize('WRITER', 'EDITOR', 'ADMIN'), validate(updatePostSchema), updatePost);
router.delete('/:id', authorize('EDITOR', 'ADMIN'), deletePost);

router.post('/:id/publish', authorize('EDITOR', 'ADMIN'), validate(publishPostSchema), publishPost);
router.post('/:id/unpublish', authorize('EDITOR', 'ADMIN'), unpublishPost);

export default router;