import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/refresh/route'

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    refreshToken: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

jest.mock('@/lib/auth', () => {
  const actual = jest.requireActual('@/lib/auth')
  return {
    ...actual,
    verifyRefreshToken: jest.fn(),
    signAccessToken: jest.fn(() => 'new-access-token'),
    signRefreshToken: jest.fn(() => 'new-refresh-token'),
    setAuthCookies: jest.fn(),
    clearAuthCookies: jest.fn(),
  }
})

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyRefreshToken } from '@/lib/auth'

const mockedCookies = cookies as jest.Mock
const mockedFindUnique = prisma.refreshToken.findUnique as jest.Mock
const mockedTransaction = prisma.$transaction as jest.Mock
const mockedVerifyRefresh = verifyRefreshToken as jest.Mock

describe('POST /api/auth/refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when refresh cookie is missing', async () => {
    mockedCookies.mockResolvedValue({ get: () => undefined })

    const response = await POST(new NextRequest('http://localhost:3000/api/auth/refresh'))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('No refresh token')
  })

  it('returns 401 for invalid refresh token signature', async () => {
    mockedCookies.mockResolvedValue({
      get: () => ({ value: 'bad-token' }),
    })
    mockedVerifyRefresh.mockReturnValue(null)

    const response = await POST(new NextRequest('http://localhost:3000/api/auth/refresh'))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('Invalid refresh token')
  })

  it('rotates tokens when refresh token is valid', async () => {
    mockedCookies.mockResolvedValue({
      get: () => ({ value: 'valid-refresh-token' }),
    })
    mockedVerifyRefresh.mockReturnValue({
      userId: 'user-1',
      email: 'user@example.com',
      role: 'WRITER',
    })
    mockedFindUnique.mockResolvedValue({
      token: 'valid-refresh-token',
      expiresAt: new Date(Date.now() + 86_400_000),
    })
    mockedTransaction.mockResolvedValue([])

    const response = await POST(new NextRequest('http://localhost:3000/api/auth/refresh'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Token refreshed')
    expect(mockedTransaction).toHaveBeenCalled()
  })
})
