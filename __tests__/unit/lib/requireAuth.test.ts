import { requireAuth, signAccessToken } from '@/lib/auth'
import { UserRole } from '@prisma/client'

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const mockedCookies = cookies as jest.Mock
const mockedFindUnique = prisma.user.findUnique as jest.Mock

function mockSession(user: { id: string; role: UserRole } | null) {
  if (!user) {
    mockedCookies.mockResolvedValue({
      get: () => undefined,
    })
    return
  }

  const token = signAccessToken({
    userId: user.id,
    email: 'user@example.com',
    role: user.role,
  })

  mockedCookies.mockResolvedValue({
    get: (name: string) =>
      name === 'access_token' ? { value: token } : undefined,
  })

  mockedFindUnique.mockResolvedValue({
    id: user.id,
    name: 'Test User',
    email: 'user@example.com',
    role: user.role,
    bio: null,
    profileImage: null,
    createdAt: new Date(),
  })
}

describe('requireAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws Unauthorized when no session exists', async () => {
    mockSession(null)
    await expect(requireAuth()).rejects.toThrow('Unauthorized')
  })

  it('returns user when authenticated without role restriction', async () => {
    mockSession({ id: '1', role: 'WRITER' })
    const user = await requireAuth()
    expect(user.role).toBe('WRITER')
  })

  it('allows ADMIN regardless of allowed roles', async () => {
    mockSession({ id: '1', role: 'ADMIN' })
    const user = await requireAuth(['WRITER'])
    expect(user.role).toBe('ADMIN')
  })

  it('throws Forbidden when role is not permitted', async () => {
    mockSession({ id: '1', role: 'WRITER' })
    await expect(requireAuth(['ADMIN'])).rejects.toThrow('Forbidden')
  })
})
