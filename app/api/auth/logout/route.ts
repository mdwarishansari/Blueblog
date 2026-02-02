import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    })
  }

  const response = NextResponse.redirect(
    new URL('/', request.url),
    { status: 303 } // 🔥 IMPORTANT
  )

  response.cookies.delete('access_token')
  response.cookies.delete('refresh_token')

  return response
}
