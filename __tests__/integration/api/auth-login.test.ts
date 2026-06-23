import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => {
  const actual = jest.requireActual('@/lib/auth')
  return {
    ...actual,
    verifyPassword: jest.fn(),
    signAccessToken: jest.fn(() => 'mock-access-token'),
    signRefreshToken: jest.fn(() => 'mock-refresh-token'),
    setAuthCookies: jest.fn(),
  }
})

import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

const mockedFindUnique = prisma.user.findUnique as jest.Mock
const mockedRefreshCreate = prisma.refreshToken.create as jest.Mock
const mockedVerifyPassword = verifyPassword as jest.Mock

function createRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedRefreshCreate.mockResolvedValue({})
  })

  it('returns 401 for unknown email', async () => {
    mockedFindUnique.mockResolvedValue(null)

    const response = await POST(
      createRequest({ email: 'missing@example.com', password: 'password123' })
    )
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('Invalid credentials')
  })

  it('returns 401 for invalid password', async () => {
    mockedFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hash',
      name: 'User',
      role: 'WRITER',
    })
    mockedVerifyPassword.mockResolvedValue(false)

    const response = await POST(
      createRequest({ email: 'user@example.com', password: 'wrongpass' })
    )

    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid payload', async () => {
    const response = await POST(createRequest({ email: 'not-an-email', password: '1' }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe('Validation error')
  })

  it('returns user and sets cookies on successful login', async () => {
    mockedFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hash',
      name: 'User',
      role: 'WRITER',
    })
    mockedVerifyPassword.mockResolvedValue(true)

    const response = await POST(
      createRequest({ email: 'user@example.com', password: 'validpass' })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Login successful')
    expect(data.user.email).toBe('user@example.com')
    expect(mockedRefreshCreate).toHaveBeenCalled()
  })
})
