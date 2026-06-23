import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/contact/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    contactMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}))

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

const mockedCreate = prisma.contactMessage.create as jest.Mock
const mockedFindMany = prisma.contactMessage.findMany as jest.Mock
const mockedRequireAuth = requireAuth as jest.Mock

describe('Contact API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/contact', () => {
    it('validates contact form payload', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'A', email: 'bad', message: 'short' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('stores valid contact messages', async () => {
      mockedCreate.mockResolvedValue({ id: 'msg-1' })

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.0.1',
        },
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'jane@example.com',
          message: 'I would like to collaborate on a project.',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Message sent')
      expect(mockedCreate).toHaveBeenCalled()
    })
  })

  describe('GET /api/contact', () => {
    it('requires ADMIN or EDITOR role', async () => {
      mockedRequireAuth.mockResolvedValue({ role: 'WRITER' })

      const request = new NextRequest('http://localhost:3000/api/contact')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.message).toBe('Forbidden')
    })

    it('returns messages for authorized admins', async () => {
      mockedRequireAuth.mockResolvedValue({ role: 'ADMIN' })
      mockedFindMany.mockResolvedValue([{ id: 'msg-1', isRead: false }])

      const request = new NextRequest('http://localhost:3000/api/contact?unread=true')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.messages).toHaveLength(1)
      expect(mockedFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isRead: false } })
      )
    })
  })
})
