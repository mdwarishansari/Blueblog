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

      res.json({
        success: true,
        data: image,
        message: 'Image uploaded successfully',
      })
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

      const { page = 1, pageSize = 20 } = req.query

      const result = await mediaService.getAllImages(Number(page), Number(pageSize))

      res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      })
    } catch (error) {
      next(error)
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

      const { id } = req.params

      const image = await mediaService.getImageById(id)

      res.json({
        success: true,
        data: image,
      })
    } catch (error) {
      next(error)
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

      const { id } = req.params

      const result = await mediaService.deleteImage(id)

      res.json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      next(error)
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

      res.json({
        success: true,
        data: images,
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new MediaController()