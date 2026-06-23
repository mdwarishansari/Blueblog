import { permissions, checkPermission, authorizeUser } from '@/lib/permissions'
import { UserRole } from '@prisma/client'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findUnique: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockedFindUnique = prisma.post.findUnique as jest.Mock

describe('lib/permissions', () => {
  describe('permissions matrix', () => {
    it('allows all dashboard roles to view dashboard', () => {
      expect(permissions.canViewDashboard('ADMIN')).toBe(true)
      expect(permissions.canViewDashboard('EDITOR')).toBe(true)
      expect(permissions.canViewDashboard('WRITER')).toBe(true)
    })

    it('restricts user and settings management to ADMIN', () => {
      expect(permissions.canManageUsers('ADMIN')).toBe(true)
      expect(permissions.canManageUsers('EDITOR')).toBe(false)
      expect(permissions.canManageSettings('ADMIN')).toBe(true)
      expect(permissions.canManageSettings('WRITER')).toBe(false)
    })

    it('allows ADMIN and EDITOR to publish posts', () => {
      expect(permissions.canPublishPosts('ADMIN')).toBe(true)
      expect(permissions.canPublishPosts('EDITOR')).toBe(true)
      expect(permissions.canPublishPosts('WRITER')).toBe(false)
    })
  })

  describe('checkPermission', () => {
    it('delegates to the correct permission function', () => {
      expect(checkPermission('WRITER', 'canManageImages')).toBe(true)
      expect(checkPermission('WRITER', 'canPublishPosts')).toBe(false)
    })
  })

  describe('authorizeUser', () => {
    beforeEach(() => {
      mockedFindUnique.mockReset()
    })

    it('grants ADMIN access to any post', async () => {
      const result = await authorizeUser('user-1', 'post-1', 'ADMIN' as UserRole)
      expect(result).toBe(true)
      expect(mockedFindUnique).not.toHaveBeenCalled()
    })

    it('grants EDITOR access to any post', async () => {
      const result = await authorizeUser('user-1', 'post-1', 'EDITOR' as UserRole)
      expect(result).toBe(true)
    })

    it('allows WRITER only when they own the post', async () => {
      mockedFindUnique.mockResolvedValue({ authorId: 'writer-1' })

      await expect(
        authorizeUser('writer-1', 'post-1', 'WRITER' as UserRole)
      ).resolves.toBe(true)

      await expect(
        authorizeUser('writer-2', 'post-1', 'WRITER' as UserRole)
      ).resolves.toBe(false)
    })

    it('denies WRITER when post is missing', async () => {
      mockedFindUnique.mockResolvedValue(null)
      await expect(
        authorizeUser('writer-1', 'missing', 'WRITER' as UserRole)
      ).resolves.toBe(false)
    })
  })
})
