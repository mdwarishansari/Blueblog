import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from '@/lib/auth'

export const runtime = 'edge'

export async function POST(_request: NextRequest) {
  try {
    // ✅ MUST await cookies() in route handlers
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'No refresh token' },
        { status: 401 }
      )
    }

    // ✅ JWT helpers are SYNC
    const payload = await verifyRefreshToken(refreshToken)
    if (!payload) {
      const res = NextResponse.json(
        { message: 'Invalid refresh token' },
        { status: 401 }
      )
      res.cookies.delete('access_token')
      res.cookies.delete('refresh_token')
      return res
    }

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    })

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      })

      const res = NextResponse.json(
        { message: 'Refresh token expired or invalid' },
        { status: 401 }
      )
      res.cookies.delete('access_token')
      res.cookies.delete('refresh_token')
      return res
    }

    const newAccessToken = await signAccessToken({
  userId: payload.userId,
  email: payload.email,
  role: payload.role,
})

const newRefreshToken = await signRefreshToken({
  userId: payload.userId,
  email: payload.email,
  role: payload.role,
})

    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    })

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: payload.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    const response = NextResponse.json({ message: 'Token refreshed' })
    setAuthCookies(response, newAccessToken, newRefreshToken)

    return response
  } catch (error) {
    console.error('Refresh token error:', error)

    const res = NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
    res.cookies.delete('access_token')
    res.cookies.delete('refresh_token')
    return res
  }
}
