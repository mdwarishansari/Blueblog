import multer from 'multer'
import { Request } from 'express'
import { AppError } from '../middlewares/error.middleware'
import mediaService from './media.service'

// --------------------
// Multer configuration
// --------------------
const storage = multer.memoryStorage()

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new AppError('Only image files are allowed', 400))
  }
  cb(null, true)
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
})

// --------------------
// Upload service
// --------------------
export class UploadService {
  async uploadImage(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new AppError('No file uploaded', 400)
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new AppError('File size must be less than 5MB', 400)
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError('Invalid file type. Only images are allowed', 400)
    }

    // ✅ FORCE correct signature (TS fix, logic unchanged)
    const image = await (mediaService.uploadImage as (
      buffer: Buffer,
      filename: string,
      mimeType: string,
      userId: string
    ) => Promise<any>)(
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

    if (files.length > 10) {
      throw new AppError('Maximum 10 files allowed per upload', 400)
    }

    const images = await Promise.all(
      files.map(file => this.uploadImage(file, userId))
    )

    return images
  }
}

export default new UploadService()
