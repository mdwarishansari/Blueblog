import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { 
  verifyRefreshToken, 
  signAccessToken, 
  signRefreshToken, 
  setAuthCookies,
  clearAuthCookies 
} from '@/lib/auth'

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'No refresh token' },
        { status: 401 }
      )
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      clearAuthCookies()
      return NextResponse.json(
        { message: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    // Check if refresh token exists in database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    })

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      })
      clearAuthCookies()
      return NextResponse.json(
        { message: 'Refresh token expired or invalid' },
        { status: 401 }
      )
    }

    // Generate new tokens
    const newAccessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    })

    const newRefreshToken = signRefreshToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    })

    // Update refresh token in database
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + 7) // 7 days

    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { token: refreshToken },
      }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          expiresAt: newExpiresAt,
          userId: payload.userId,
        },
      }),
    ])

    // Set new cookies
    const response = NextResponse.json({
      message: 'Token refreshed',
    })

    setAuthCookies(response, newAccessToken, newRefreshToken)


    return response
  } catch (error) {
    console.error('Refresh token error:', error)
    clearAuthCookies()
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}