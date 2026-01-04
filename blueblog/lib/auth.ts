import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1d',
  })
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  })
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload
  } catch {
    return null
  }
}


export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: false,
  })

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: false,
  })
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  
  if (!accessToken) return null
  
  const payload = verifyAccessToken(accessToken)
  if (!payload) return null
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      profileImage: true,
      createdAt: true,
    },
  })
  
  return user
}

export async function requireAuth(role?: UserRole) {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  if (role && user.role !== role && user.role !== 'ADMIN') {
    if (role === 'EDITOR' && user.role !== 'EDITOR') {
      throw new Error('Forbidden')
    }
  }
  
  return user
}

export async function rotateRefreshToken(oldRefreshToken: string) {
  const payload = verifyRefreshToken(oldRefreshToken)
  if (!payload) return null
  
  // Delete old refresh token
  await prisma.refreshToken.deleteMany({
    where: { token: oldRefreshToken },
  })
  
  // Create new refresh token
  const newRefreshToken = signRefreshToken(payload)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days
  
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      expiresAt,
      userId: payload.userId,
    },
  })
  
  return newRefreshToken
}