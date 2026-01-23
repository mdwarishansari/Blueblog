import { Request, Response, NextFunction } from 'express'
import prisma from '../utils/prisma'
import { AppError } from '../middlewares/error.middleware'

class ImageController {
  async createImage(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        url,
        altText,
        title,
        caption,
        width,
        height,
      } = req.body

      if (!url) {
        return next(new AppError('Image url is required', 400))
      }

      const image = await prisma.image.create({
        data: {
          url,
          altText,
          title,
          caption,
          width,
          height,
        },
      })

      return res.status(201).json({
        success: true,
        data: image,
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new ImageController()
