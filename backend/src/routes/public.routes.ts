import { Router } from 'express'
import postsController from '../controllers/posts.controller'
import categoriesController from '../controllers/categories.controller'
import messagesController from '../controllers/messages.controller'
import settingsController from '../controllers/settings.controller'
import usersController from '../controllers/users.controller'
import { validate } from '../utils/validation'
import { schemas } from '../utils/validation'

const router = Router()

// Public posts routes
router.get('/posts', postsController.getPosts)
router.get('/posts/:slug', postsController.getPostBySlug)

// Public categories routes
router.get('/categories', categoriesController.getAllCategories)
router.get('/categories/:slug', categoriesController.getCategoryBySlug)
router.get('/categories/:slug/posts', categoriesController.getCategoryPosts)

// Contact form
router.post(
  '/contact',
  validate(schemas.contact),
  messagesController.createMessage
)

// Settings (public)
router.get('/settings', settingsController.getSettings)
router.get('/settings/site-info', settingsController.getSiteInfo)
router.get('/settings/social-links', settingsController.getSocialLinks)

// Public team members (About page)
router.get('/team', usersController.getPublicTeamMembers)

export default router