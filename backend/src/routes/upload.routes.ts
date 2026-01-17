import { Router } from 'express'
import mediaController from '../controllers/media.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/role.middleware'
import { upload } from '../services/upload.service'

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

// Multiple images upload (optional)
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

      const files = req.files as Express.Multer.File[]
      const uploadPromises = files.map(file =>
        mediaController.uploadImage({ ...req, file } as any, res as any, next)
      )
      
      const results = await Promise.all(uploadPromises)
      
      res.json({
        success: true,
        data: results.map(r => r.data),
        message: 'Images uploaded successfully',
      })
    } catch (error) {
      next(error)
    }
  }
)

export default router