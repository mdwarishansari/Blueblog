import { Request, Response, NextFunction } from 'express'
import usersService from '../services/users.service'

export class UsersController {
  async getPublicTeamMembers(_req: Request, res: Response, next: NextFunction) {
    try {
      const team = await usersService.getPublicTeamMembers()

      return res.json({
        success: true,
        data: team,
      })
    } catch (error) {
      return next(error)
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const users = await usersService.getAllUsers(req.user.id, req.user.role)

      return res.json({
        success: true,
        data: users,
      })
    } catch (error) {
      return next(error)
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const id = String(req.params.id)

      const user = await usersService.getUserById(
        id,
        req.user.id,
        req.user.role
      )

      return res.json({
        success: true,
        data: user,
      })
    } catch (error) {
      return next(error)
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const userData = req.body
      const user = await usersService.createUser(userData)

      return res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      })
    } catch (error) {
      return next(error)
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const id = String(req.params.id)
      const updateData = req.body

      const user = await usersService.updateUser(
        id,
        updateData,
        req.user.id,
        req.user.role
      )

      return res.json({
        success: true,
        data: user,
        message: 'User updated successfully',
      })
    } catch (error) {
      return next(error)
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const id = String(req.params.id)

      const result = await usersService.deleteUser(
        id,
        req.user.id,
      )

      return res.json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      return next(error)
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const updateData = req.body
      const user = await usersService.updateProfile(req.user.id, updateData)

      return res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
      })
    } catch (error) {
      return next(error)
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const { currentPassword, newPassword } = req.body

      await usersService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      )

      return res.json({
        success: true,
        message: 'Password changed successfully',
      })
    } catch (error) {
      return next(error)
    }
  }
}

export default new UsersController()
