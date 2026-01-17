import { Router } from 'express'
import publicRoutes from './public.routes'
import authRoutes from './auth.routes'
import adminRoutes from './admin.routes'
import uploadRoutes from './upload.routes'

const router = Router()

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'BlueBlog API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

// API routes
router.use('/', publicRoutes)
router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)
router.use('/upload', uploadRoutes)

export default router