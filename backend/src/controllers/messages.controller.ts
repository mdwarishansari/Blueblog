import { Request, Response, NextFunction } from 'express'
import messagesService from '../services/messages.service'

export class MessagesController {
  async createMessage(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('CONTACT BODY:', req.body)

      const { name, email, message } = req.body || {}

      if (
        typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof message !== 'string' ||
        !name.trim() ||
        !email.trim() ||
        !message.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and message are required',
        })
      }

      const contactMessage = await messagesService.createMessage(
        name.trim(),
        email.trim(),
        message.trim()
      )

      return res.status(201).json({
        success: true,
        data: contactMessage,
        message: 'Message sent successfully',
      })
    } catch (error) {
      return next(error)
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

      const page = Number(req.query.page ?? 1)
      const pageSize = Number(req.query.pageSize ?? 20)
      const isRead =
        req.query.isRead === 'true'
          ? true
          : req.query.isRead === 'false'
          ? false
          : undefined

      const result = await messagesService.getAllMessages(
        page,
        pageSize,
        isRead
      )

      return res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      })
    } catch (error) {
      return next(error)
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

      const id = String(req.params.id)

      const message = await messagesService.getMessageById(id)

      return res.json({
        success: true,
        data: message,
      })
    } catch (error) {
      return next(error)
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

      const id = String(req.params.id)

      const result = await messagesService.deleteMessage(id)

      return res.json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      return next(error)
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

      const id = String(req.params.id)

      const message = await messagesService.markAsRead(id)

      return res.json({
        success: true,
        data: message,
        message: 'Message marked as read',
      })
    } catch (error) {
      return next(error)
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

      const id = String(req.params.id)

      const message = await messagesService.markAsUnread(id)

      return res.json({
        success: true,
        data: message,
        message: 'Message marked as unread',
      })
    } catch (error) {
      return next(error)
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

      return res.json({
        success: true,
        data: { count },
      })
    } catch (error) {
      return next(error)
    }
  }
}

export default new MessagesController()
