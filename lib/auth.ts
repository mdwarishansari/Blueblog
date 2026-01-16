import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */
export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
  exp: number
}

/* ------------------------------------------------------------------ */
/* ENV (BRACKET ACCESS — AS REQUESTED)                                 */
/* ------------------------------------------------------------------ */
const ACCESS_SECRET = process.env['JWT_ACCESS_SECRET']!
const REFRESH_SECRET = process.env['JWT_REFRESH_SECRET']!

const ACCESS_TTL = 60 * 60 * 24 // 1 day (seconds)
const REFRESH_TTL = 60 * 60 * 24 * 7 // 7 days

/* ------------------------------------------------------------------ */
/* PASSWORD (EDGE-SAFE, TS-SAFE)                                       */
/* ------------------------------------------------------------------ */
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password)
  const hash = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === hashedPassword
}

/* ------------------------------------------------------------------ */
/* JWT HELPERS (EDGE + TS FRIENDLY)                                    */
/* ------------------------------------------------------------------ */
function base64url(input: Uint8Array | string) {
  const str =
    typeof input === 'string'
      ? input
      : String.fromCharCode(...input)

  return btoa(str)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

async function signJWT(
  payload: Omit<TokenPayload, 'exp'>,
  secret: string,
  ttl: number
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const exp = Math.floor(Date.now() / 1000) + ttl

  const body: TokenPayload = { ...payload, exp }

  const headerPart = base64url(JSON.stringify(header))
  const payloadPart = base64url(JSON.stringify(body))
  const data = `${headerPart}.${payloadPart}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  )

  return `${data}.${base64url(new Uint8Array(signature))}`
}

async function verifyJWT(
  token: string,
  secret: string
): Promise<TokenPayload | null> {
  try {
    const [h, p, s] = token.split('.')
    if (!h || !p || !s) return null

    const data = `${h}.${p}`

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signature = Uint8Array.from(
      atob(s.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    )

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      new TextEncoder().encode(data)
    )

    if (!valid) return null

    const payload = JSON.parse(
      atob(p.replace(/-/g, '+').replace(/_/g, '/'))
    ) as TokenPayload

    if (payload.exp < Math.floor(Date.now() / 1000)) return null

    return payload
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/* PUBLIC TOKEN API                                                    */
/* ------------------------------------------------------------------ */
export function signAccessToken(
  payload: Omit<TokenPayload, 'exp'>
) {
  return signJWT(payload, ACCESS_SECRET, ACCESS_TTL)
}

export function signRefreshToken(
  payload: Omit<TokenPayload, 'exp'>
) {
  return signJWT(payload, REFRESH_SECRET, REFRESH_TTL)
}

export function verifyAccessToken(token: string) {
  return verifyJWT(token, ACCESS_SECRET)
}

export function verifyRefreshToken(token: string) {
  return verifyJWT(token, REFRESH_SECRET)
}

/* ------------------------------------------------------------------ */
/* COOKIES                                                            */
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
    secure: true,
  })

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: true,
  })
}

export async function clearAuthCookies() {
  const store = await cookies()
  store.delete('access_token')
  store.delete('refresh_token')
}

/* ------------------------------------------------------------------ */
/* USER HELPERS                                                        */
/* ------------------------------------------------------------------ */
export async function getCurrentUser() {
  const store = await cookies()
  const token = store.get('access_token')?.value
  if (!token) return null

  const payload = await verifyAccessToken(token)
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
  if (!user) throw new Error('Unauthorized')

  if (!allowedRoles || user.role === 'ADMIN') return user
  if (!allowedRoles.includes(user.role)) throw new Error('Forbidden')

  return user
}

/* ------------------------------------------------------------------ */
/* REFRESH TOKEN ROTATION                                              */
/* ------------------------------------------------------------------ */
export async function rotateRefreshToken(oldToken: string) {
  const payload = await verifyRefreshToken(oldToken)
  if (!payload) return null

  await prisma.refreshToken.deleteMany({
    where: { token: oldToken },
  })

  const newToken = await signRefreshToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  })

  const expiresAt = new Date(Date.now() + REFRESH_TTL * 1000)

  await prisma.refreshToken.create({
    data: {
      token: newToken,
      expiresAt,
      userId: payload.userId,
    },
  })

  return newToken
}
