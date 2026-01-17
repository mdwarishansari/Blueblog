import prisma from '../utils/prisma'
import { AppError } from '../middlewares/error.middleware'

export class MessagesService {
  async createMessage(name: string, email: string, message: string) {
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
      },
    })

    return contactMessage
  }

  async getAllMessages(page: number = 1, pageSize: number = 20, isRead?: boolean) {
    const skip = (page - 1) * pageSize

    const where = isRead !== undefined ? { isRead } : {}

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactMessage.count({ where }),
    ])

    return {
      data: messages,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  async getMessageById(id: string) {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!message) {
      throw new AppError('Message not found', 404)
    }

    // Mark as read when retrieved
    if (!message.isRead) {
      await prisma.contactMessage.update({
        where: { id },
        data: { isRead: true },
      })
    }

    return message
  }

  async deleteMessage(id: string) {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!message) {
      throw new AppError('Message not found', 404)
    }

    await prisma.contactMessage.delete({
      where: { id },
    })

    return { message: 'Message deleted successfully' }
  }

  async markAsRead(id: string) {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!message) {
      throw new AppError('Message not found', 404)
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    })

    return updatedMessage
  }

  async markAsUnread(id: string) {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!message) {
      throw new AppError('Message not found', 404)
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: false },
    })

    return updatedMessage
  }

  async getUnreadCount() {
    const count = await prisma.contactMessage.count({
      where: { isRead: false },
    })

    return count
  }
}

export default new MessagesService()