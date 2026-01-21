import { Request, Response, NextFunction } from 'express'
import settingsService from '../services/settings.service'

export class SettingsController {
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getSettings()

      res.json({
        success: true,
        data: settings,
      })
    } catch (error) {
      next(error)
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

      res.json({
        success: true,
        data: settings,
        message: 'Settings updated successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  // async getSocialLinks(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const socialLinks = await settingsService.getSocialLinks()

  //     res.json({
  //       success: true,
  //       data: socialLinks,
  //     })
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  // async updateSocialLinks(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     if (!req.user) {
  //       return res.status(401).json({
  //         success: false,
  //         message: 'Authentication required',
  //       })
  //     }

  //     const social = req.body

  //     const settings = await settingsService.updateSocialLinks(social)

  //     res.json({
  //       success: true,
  //       data: settings.social,
  //       message: 'Social links updated successfully',
  //     })
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  // async getSiteInfo(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const siteInfo = await settingsService.getSiteInfo()

  //     res.json({
  //       success: true,
  //       data: siteInfo,
  //     })
  //   } catch (error) {
  //     next(error)
  //   }
  // }

//   async updateSiteInfo(req: Request, res: Response, next: NextFunction) {
//     try {
//       if (!req.user) {
//         return res.status(401).json({
//           success: false,
//           message: 'Authentication required',
//         })
//       }

//       const siteInfo = req.body

//       const settings = await settingsService.updateSiteInfo(siteInfo)

//       res.json({
//         success: true,
//         data: {
//           siteName: settings.siteName,
//           siteUrl: settings.siteUrl,
//           description: settings.description,
//         },
//         message: 'Site info updated successfully',
//       })
//     } catch (error) {
//       next(error)
//     }
//   }
 }

export default new SettingsController()