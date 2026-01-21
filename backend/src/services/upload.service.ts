import multer from 'multer'
import path from 'path'
import { Request } from 'express'
import { AppError } from '../middlewares/error.middleware'
import mediaService from './media.service'

// Configure multer for memory storage
const storage = multer.memoryStorage()

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new AppError('Only image files are allowed', 400))
  }

  cb(null, true)
}


// Configure multer
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
})

export class UploadService {
  async uploadImage(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new AppError('No file uploaded', 400)
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      throw new AppError('File size must be less than 5MB', 400)
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError('Invalid file type. Only images are allowed', 400)
    }

    // Upload to media service  
   const image = await mediaService.uploadImage(
  file.buffer,
  file.originalname,
  file.mimetype,
  userId
)

    return image
  }

  async uploadMultipleImages(files: Express.Multer.File[], userId: string) {
    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400)
    }

    // Limit number of files
    if (files.length > 10) {
      throw new AppError('Maximum 10 files allowed per upload', 400)
    }

    const uploadPromises = files.map(file => this.uploadImage(file, userId))
    const images = await Promise.all(uploadPromises)

    return images
  }
}

export default new UploadService()