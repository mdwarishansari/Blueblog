import { Request, Response, NextFunction } from 'express'
import usersService from '../services/users.service'

export class UsersController {
  async getPublicTeamMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await usersService.getPublicTeamMembers()
      res.json({
        success: true,
        data: team,
      })
    } catch (error) {
      next(error)
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

      res.json({
        success: true,
        data: users,
      })
    } catch (error) {
      next(error)
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

      const { id } = req.params

      const user = await usersService.getUserById(id, req.user.id, req.user.role)

      res.json({
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
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

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      })
    } catch (error) {
      next(error)
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

      const { id } = req.params
      const updateData = req.body

      const user = await usersService.updateUser(
        id,
        updateData,
        req.user.id,
        req.user.role
      )

      res.json({
        success: true,
        data: user,
        message: 'User updated successfully',
      })
    } catch (error) {
      next(error)
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

      const { id } = req.params

      const result = await usersService.deleteUser(id, req.user.id, req.user.role)

      res.json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      next(error)
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

      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
      })
    } catch (error) {
      next(error)
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

      await usersService.changePassword(req.user.id, currentPassword, newPassword)

      res.json({
        success: true,
        message: 'Password changed successfully',
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new UsersController()