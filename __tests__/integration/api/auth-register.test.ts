import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/register/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
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
    hashPassword: jest.fn(async () => 'hashed-password'),
    signAccessToken: jest.fn(() => 'mock-access-token'),
    signRefreshToken: jest.fn(() => 'mock-refresh-token'),
    setAuthCookies: jest.fn(),
  }
})

import { prisma } from '@/lib/prisma'

const mockedFindUnique = prisma.user.findUnique as jest.Mock
const mockedCreate = prisma.user.create as jest.Mock
const mockedRefreshCreate = prisma.refreshToken.create as jest.Mock

function createRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validPayload = {
  name: 'Jane Writer',
  email: 'jane@example.com',
  password: 'StrongPass1',
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedRefreshCreate.mockResolvedValue({})
  })

  it('rejects weak passwords via Zod validation', async () => {
    const response = await POST(
      createRequest({
        name: 'Jane',
        email: 'jane@example.com',
        password: 'weak',
      })
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe('Validation error')
  })

  it('returns 400 when email already exists', async () => {
    mockedFindUnique.mockResolvedValue({ id: 'existing' })

    const response = await POST(createRequest(validPayload))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe('An account with this email already exists')
  })

  it('creates WRITER account and returns user payload', async () => {
    mockedFindUnique.mockResolvedValue(null)
    mockedCreate.mockResolvedValue({
      id: 'new-user',
      name: validPayload.name,
      email: validPayload.email,
      role: 'WRITER',
    })

    const response = await POST(createRequest(validPayload))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Registration successful')
    expect(data.user.role).toBe('WRITER')
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: validPayload.email,
          role: 'WRITER',
        }),
      })
    )
  })
})
