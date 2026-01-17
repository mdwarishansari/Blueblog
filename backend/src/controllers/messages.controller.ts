import { Request, Response, NextFunction } from 'express'
import messagesService from '../services/messages.service'

export class MessagesController {
  async createMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, message } = req.body

      const contactMessage = await messagesService.createMessage(name, email, message)

      res.status(201).json({
        success: true,
        data: contactMessage,
        message: 'Message sent successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  async getAllMessages(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const { page = 1, pageSize = 20, isRead } = req.query

      const result = await messagesService.getAllMessages(
        Number(page),
        Number(pageSize),
        isRead === 'true' ? true : isRead === 'false' ? false : undefined
      )

      res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      })
    } catch (error) {
      next(error)
    }
  }

  async getMessageById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const { id } = req.params

      const message = await messagesService.getMessageById(id)

      res.json({
        success: true,
        data: message,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const { id } = req.params

      const result = await messagesService.deleteMessage(id)

      res.json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      next(error)
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const { id } = req.params

      const message = await messagesService.markAsRead(id)

      res.json({
        success: true,
        data: message,
        message: 'Message marked as read',
      })
    } catch (error) {
      next(error)
    }
  }

  async markAsUnread(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const { id } = req.params

      const message = await messagesService.markAsUnread(id)

      res.json({
        success: true,
        data: message,
        message: 'Message marked as unread',
      })
    } catch (error) {
      next(error)
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const count = await messagesService.getUnreadCount()

      res.json({
        success: true,
        data: { count },
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new MessagesController()