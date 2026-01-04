import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { clearAuthCookies } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    // Delete refresh token from database if it exists
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      })
    }

    // Clear cookies
    const response = NextResponse.json({
      message: 'Logout successful',
    })

    await clearAuthCookies()

    return response
  } catch (error) {
    console.error('Logout error:', error)
    
    // Still try to clear cookies even if there's an error
    await clearAuthCookies()
    
    return NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    )
  }
}