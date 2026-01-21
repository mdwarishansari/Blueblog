import { Request, Response, NextFunction } from 'express'
import mediaService from '../services/media.service'
import uploadService from '../services/upload.service'

export class MediaController {
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const file = req.file
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        })
      }

      const image = await uploadService.uploadImage(file, req.user.id)

      return res.json({
        success: true,
        data: image,
        message: 'Image uploaded successfully',
      })
    } catch (error) {
      return next(error)
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
