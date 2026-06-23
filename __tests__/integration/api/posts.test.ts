import { NextRequest } from 'next/server'
import { GET } from '@/app/api/posts/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockedFindMany = prisma.post.findMany as jest.Mock
const mockedCount = prisma.post.count as jest.Mock

describe('GET /api/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns published posts with pagination metadata', async () => {
    mockedFindMany.mockResolvedValue([
      {
        id: 'post-1',
        title: 'Published Post',
        slug: 'published-post',
        status: 'PUBLISHED',
      },
    ])
    mockedCount.mockResolvedValue(1)

    const request = new NextRequest('http://localhost:3000/api/posts?page=1&limit=12')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.posts).toHaveLength(1)
    expect(data.pagination).toEqual({
      page: 1,
      limit: 12,
      total: 1,
      pages: 1,
    })
  })

  it('applies search and category filters in query', async () => {
    mockedFindMany.mockResolvedValue([])
    mockedCount.mockResolvedValue(0)

    const request = new NextRequest(
      'http://localhost:3000/api/posts?search=nextjs&category=tech'
    )
    await GET(request)

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PUBLISHED',
          categories: { some: { slug: 'tech' } },
          OR: expect.any(Array),
        }),
      })
    )
  })

  it('returns 500 when database query fails', async () => {
    mockedFindMany.mockRejectedValue(new Error('DB down'))

    const request = new NextRequest('http://localhost:3000/api/posts')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.message).toBe('Failed to fetch posts')
  })
})
