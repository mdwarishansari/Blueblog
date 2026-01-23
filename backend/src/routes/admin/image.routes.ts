import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import ImageController from '../../controllers/image.controller'

const router = Router()

router.post('/', authenticate, ImageController.createImage)

export default router
