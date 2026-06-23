import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/admin/posts/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}))

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

const mockedRequireAuth = requireAuth as jest.Mock
const mockedFindMany = prisma.post.findMany as jest.Mock
const mockedCount = prisma.post.count as jest.Mock
const mockedFindUnique = prisma.post.findUnique as jest.Mock
const mockedCreate = prisma.post.create as jest.Mock

describe('Admin posts API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/admin/posts', () => {
    it('scopes results to writer-owned posts', async () => {
      mockedRequireAuth.mockResolvedValue({
        id: 'writer-1',
        role: 'WRITER',
      })
      mockedFindMany.mockResolvedValue([])
      mockedCount.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/admin/posts')
      await GET(request)

      expect(mockedFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ authorId: 'writer-1' }),
        })
      )
    })

    it('returns error payload when auth fails', async () => {
      mockedRequireAuth.mockRejectedValue(new Error('Unauthorized'))

      const request = new NextRequest('http://localhost:3000/api/admin/posts')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.message).toBe('Unauthorized')
    })
  })

  describe('POST /api/admin/posts', () => {
    const basePayload = {
      title: 'Draft Post',
      slug: 'draft-post',
      content: { type: 'doc', content: [] },
      status: 'DRAFT',
    }

    it('blocks writers from publishing directly', async () => {
      mockedRequireAuth.mockResolvedValue({
        id: 'writer-1',
        role: 'WRITER',
      })

      const request = new NextRequest('http://localhost:3000/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...basePayload, status: 'PUBLISHED' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.message).toBe('Writers can only create drafts.')
    })

    it('rejects duplicate slugs', async () => {
      mockedRequireAuth.mockResolvedValue({
        id: 'editor-1',
        role: 'EDITOR',
      })
      mockedFindUnique.mockResolvedValue({ id: 'existing-post' })

      const request = new NextRequest('http://localhost:3000/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basePayload),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('A post with this slug already exists')
    })

    it('creates draft post for authorized users', async () => {
      mockedRequireAuth.mockResolvedValue({
        id: 'editor-1',
        role: 'EDITOR',
      })
      mockedFindUnique.mockResolvedValue(null)
      mockedCreate.mockResolvedValue({
        id: 'post-new',
        ...basePayload,
        authorId: 'editor-1',
      })

      const request = new NextRequest('http://localhost:3000/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basePayload),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Post created successfully')
      expect(mockedCreate).toHaveBeenCalled()
    })
  })
})
