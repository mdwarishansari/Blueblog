import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */
export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
}

/* ------------------------------------------------------------------ */
/* PASSWORD HELPERS                                                    */
/* ------------------------------------------------------------------ */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/* ------------------------------------------------------------------ */
/* JWT HELPERS                                                         */
/* ------------------------------------------------------------------ */
const ACCESS_SECRET = process.env['JWT_ACCESS_SECRET'] as Secret
const REFRESH_SECRET = process.env['JWT_REFRESH_SECRET']as Secret

const ACCESS_EXPIRES_IN =
  (process.env['ACCESS_TOKEN_EXPIRES_IN'] as SignOptions['expiresIn']) || '1d'

const REFRESH_EXPIRES_IN =
  (process.env['REFRESH_TOKEN_EXPIRES_IN'] as SignOptions['expiresIn']) || '7d'

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  })
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  })
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/* COOKIE HELPERS                                                      */
/* ------------------------------------------------------------------ */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  })

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function clearAuthCookies() {
  const store = await cookies()
  store.delete('access_token')
  store.delete('refresh_token')
}


/* ------------------------------------------------------------------ */
/* AUTH HELPERS                                                        */
/* ------------------------------------------------------------------ */
export async function getCurrentUser() {
  const store = await cookies()
  const accessToken = store.get('access_token')?.value

  if (!accessToken) return null

  const payload = verifyAccessToken(accessToken)
  if (!payload) return null

  return prisma.user.findUnique({
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
}

export async function requireAuth(allowedRoles?: UserRole[]) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  if (!allowedRoles) {
    return user
  }

  if (user.role === 'ADMIN') {
    return user
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden')
  }

  return user
}

/* ------------------------------------------------------------------ */
/* REFRESH TOKEN ROTATION                                              */
/* ------------------------------------------------------------------ */
export async function rotateRefreshToken(oldRefreshToken: string) {
  const payload = verifyRefreshToken(oldRefreshToken)
  if (!payload) return null

  await prisma.refreshToken.deleteMany({
    where: { token: oldRefreshToken },
  })

  const newRefreshToken = signRefreshToken(payload)

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      expiresAt,
      userId: payload.userId,
    },
  })

  return newRefreshToken
}
