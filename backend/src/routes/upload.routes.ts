import { Router } from 'express'
import mediaController from '../controllers/media.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/role.middleware'
import { upload } from '../services/upload.service'
import uploadService from '../services/upload.service'

const router = Router()

// All upload routes require authentication
router.use(authenticate)

// Single image upload
router.post(
  '/image',
  authorize(['ADMIN', 'EDITOR', 'WRITER']),
  upload.single('file'),
  mediaController.uploadImage
)

// Multiple images upload
router.post(
  '/images',
  authorize(['ADMIN', 'EDITOR', 'WRITER']),
  upload.array('files', 10),
  async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const files = req.files as Express.Multer.File[] | undefined

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
        })
      }

      // ✅ call SERVICE, not controller
      const images = await Promise.all(
        files.map(file => uploadService.uploadImage(file, req.user!.id))
      )

      return res.json({
        success: true,
        data: images,
        message: 'Images uploaded successfully',
      })
    } catch (error) {
      return next(error)
    }
  }
)

export default router
