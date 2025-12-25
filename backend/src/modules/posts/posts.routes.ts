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

// Public routes
router.get('/', validate(getPostsSchema), getPosts);
router.get('/slug/:slug', getPostBySlug);
router.get('/:id/related', getRelatedPosts);

// Protected routes
router.use(authenticate);

// Create post (WRITER, EDITOR, ADMIN)
router.post('/', authorize('WRITER', 'EDITOR', 'ADMIN'), createRateLimiter, validate(createPostSchema), createPost);

// Update and delete post (author or EDITOR/ADMIN)
router.get('/:id', getPost);
router.put('/:id', authorize('WRITER', 'EDITOR', 'ADMIN'), validate(updatePostSchema), updatePost);
router.delete('/:id', authorize('EDITOR', 'ADMIN'), deletePost);

// Publish/Unpublish (EDITOR, ADMIN)
router.post('/:id/publish', authorize('EDITOR', 'ADMIN'), validate(publishPostSchema), publishPost);
router.post('/:id/unpublish', authorize('EDITOR', 'ADMIN'), unpublishPost);

export default router;