import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setAuthCookies,
  type TokenPayload,
} from '@/lib/auth'
import { NextResponse } from 'next/server'


const payload: TokenPayload = {
  userId: 'user-123',
  email: 'test@example.com',
  role: 'WRITER',
}

describe('lib/auth', () => {
  describe('password helpers', () => {
    it('hashes and verifies passwords correctly', async () => {
      const hash = await hashPassword('SecurePass123!')
      expect(hash).not.toBe('SecurePass123!')
      expect(await verifyPassword('SecurePass123!', hash)).toBe(true)
      expect(await verifyPassword('WrongPassword', hash)).toBe(false)
    })
  })

  describe('JWT helpers', () => {
    it('signs and verifies access tokens', () => {
      const token = signAccessToken(payload)
      expect(verifyAccessToken(token)).toMatchObject(payload)
    })

    it('signs and verifies refresh tokens', () => {
      const token = signRefreshToken(payload)
      expect(verifyRefreshToken(token)).toMatchObject(payload)
    })

    it('returns null for tampered tokens', () => {
      const token = signAccessToken(payload)
      expect(verifyAccessToken(`${token}x`)).toBeNull()
    })

    it('returns null for tokens signed with wrong secret', () => {
      const refreshToken = signRefreshToken(payload)
      expect(verifyAccessToken(refreshToken)).toBeNull()
    })
  })

  describe('setAuthCookies', () => {
    it('sets httpOnly auth cookies on response', () => {
      const response = NextResponse.json({ ok: true })
      setAuthCookies(response, 'access-token', 'refresh-token')

      const cookies = response.cookies.getAll()
      const access = cookies.find((c) => c.name === 'access_token')
      const refresh = cookies.find((c) => c.name === 'refresh_token')

      expect(access?.value).toBe('access-token')
      expect(refresh?.value).toBe('refresh-token')
    })
  })

  describe('rotateRefreshToken', () => {
    it('returns null for invalid refresh tokens', async () => {
      const { rotateRefreshToken } = await import('@/lib/auth')
      await expect(rotateRefreshToken('invalid-token')).resolves.toBeNull()
    })
  })
})
