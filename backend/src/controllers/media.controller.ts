import { Request, Response, NextFunction } from 'express'
import mediaService from '../services/media.service'
// import uploadService from '../services/upload.service'
import { AppError } from '../middlewares/error.middleware'


export class MediaController {

async createImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { url, publicId, width, height } = req.body

    if (!url || !publicId) {
      return next(new AppError('Invalid image data', 400))
    }

    const image = await mediaService.createImage({
      url,
      publicId,
      width,
      height,
    })

    return res.json({ success: true, data: image })
  } catch (error) {
    next(error)
  }
}

  async getAllImages(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const page = Number(req.query.page ?? 1)
      const pageSize = Number(req.query.pageSize ?? 20)

      const result = await mediaService.getAllImages(page, pageSize)

      return res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      })
    } catch (error) {
      return next(error)
    }
  }

  async getImageById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const id = String(req.params.id)

      const image = await mediaService.getImageById(id)

      return res.json({
        success: true,
        data: image,
      })
    } catch (error) {
      return next(error)
    }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const id = String(req.params.id)

      const result = await mediaService.deleteImage(id)

      return res.json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      return next(error)
    }
  }

  async getImagesByUsage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const images = await mediaService.getImagesByUsage()

      return res.json({
        success: true,
        data: images,
      })
    } catch (error) {
      return next(error)
    }
  }
}

export default new MediaController()
