import { Request, Response, NextFunction } from 'express'
import settingsService from '../services/settings.service'

export class SettingsController {
  async getSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getSettings()

      return res.json({
        success: true,
        data: settings,
      })
    } catch (error) {
      return next(error)
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const updateData = req.body

      const settings = await settingsService.updateSettings(updateData)

      return res.json({
        success: true,
        data: settings,
        message: 'Settings updated successfully',
      })
    } catch (error) {
      return next(error)
    }
  }
}

export default new SettingsController()
