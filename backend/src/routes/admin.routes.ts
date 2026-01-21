import { Router } from 'express'
import postsController from '../controllers/posts.controller'
import categoriesController from '../controllers/categories.controller'
import usersController from '../controllers/users.controller'
import mediaController from '../controllers/media.controller'
import messagesController from '../controllers/messages.controller'
import settingsController from '../controllers/settings.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/role.middleware'
import { validate } from '../utils/validation'
import { schemas } from '../utils/validation'

const router = Router()

// All admin routes require authentication
router.use(authenticate)

// Posts (Admin)
router.get('/posts', postsController.getPosts)
router.get('/posts/:id', postsController.getPostById)
router.post(
  '/posts',
  authorize(['ADMIN', 'EDITOR', 'WRITER']),
  validate(schemas.createPost),
  postsController.createPost
)
router.put(
  '/posts/:id',
  authorize(['ADMIN', 'EDITOR', 'WRITER']),
  validate(schemas.updatePost),
  postsController.updatePost
)
router.delete(
  '/posts/:id',
  authorize(['ADMIN', 'EDITOR']),
  postsController.deletePost
)

// Categories (Admin)
router.get(
  '/categories',
  authorize(['ADMIN', 'EDITOR']),
  categoriesController.getAdminCategories
)
router.post(
  '/categories',
  authorize(['ADMIN', 'EDITOR']),
  validate(schemas.createCategory),
  categoriesController.createCategory
)
router.put(
  '/categories/:id',
  authorize(['ADMIN', 'EDITOR']),
  validate(schemas.updateCategory),
  categoriesController.updateCategory
)
router.delete(
  '/categories/:id',
  authorize(['ADMIN', 'EDITOR']),
  categoriesController.deleteCategory
)

// Users (Admin only)
router.get(
  '/users',
  authorize(['ADMIN']),
  usersController.getAllUsers
)
router.get(
  '/users/:id',
  authorize(['ADMIN']),
  usersController.getUserById
)
router.post(
  '/users',
  authorize(['ADMIN']),
  validate(schemas.createUser),
  usersController.createUser
)
router.put(
  '/users/:id',
  authorize(['ADMIN']),
  validate(schemas.updateUser),
  usersController.updateUser
)
router.delete(
  '/users/:id',
  authorize(['ADMIN']),
  usersController.deleteUser
)

// Media (Admin/Editor/Writer)
router.get(
  '/media',
  authorize(['ADMIN', 'EDITOR', 'WRITER']),
  mediaController.getAllImages
)
router.get(
  '/media/:id',
  authorize(['ADMIN', 'EDITOR', 'WRITER']),
  mediaController.getImageById
)
router.delete(
  '/media/:id',
  authorize(['ADMIN', 'EDITOR']),
  mediaController.deleteImage
)
router.get(
  '/media/usage/stats',
  authorize(['ADMIN', 'EDITOR']),
  mediaController.getImagesByUsage
)

// Messages (Admin)
router.get(
  '/messages',
  authorize(['ADMIN']),
  messagesController.getAllMessages
)
router.get(
  '/messages/:id',
  authorize(['ADMIN']),
  messagesController.getMessageById
)
router.delete(
  '/messages/:id',
  authorize(['ADMIN']),
  messagesController.deleteMessage
)
router.put(
  '/messages/:id/read',
  authorize(['ADMIN']),
  messagesController.markAsRead
)
router.put(
  '/messages/:id/unread',
  authorize(['ADMIN']),
  messagesController.markAsUnread
)
router.get(
  '/messages/unread/count',
  authorize(['ADMIN']),
  messagesController.getUnreadCount
)

// Settings (Admin only)
router.get(
  '/settings',
  authorize(['ADMIN']),
  settingsController.getSettings
)
router.put(
  '/settings',
  authorize(['ADMIN']),
  validate(schemas.updateSettings),
  settingsController.updateSettings
)


// Profile (All authenticated users)
router.put(
  '/profile',
  usersController.updateProfile
)
router.post(
  '/profile/change-password',
  validate(schemas.changePassword),
  usersController.changePassword
)

export default router