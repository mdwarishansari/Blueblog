import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from './index'
import prisma from './database'
import { AuthenticationError } from '../utils/appError'
import { UserRole } from '@prisma/client'

export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
}

/* ================= ACCESS TOKEN ================= */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload,
    config.jwt.accessSecret as string,
    {
      expiresIn: config.jwt.accessExpiresIn as SignOptions['expiresIn'],
    }
  )
}

/* ================= REFRESH TOKEN ================= */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload,
    config.jwt.refreshSecret as string,
    {
      expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'],
    }
  )
}

/* ================= VERIFY ACCESS ================= */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(
      token,
      config.jwt.accessSecret as string
    ) as TokenPayload
  } catch {
    throw new AuthenticationError('Invalid or expired access token')
  }
}

/* ================= VERIFY REFRESH ================= */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(
      token,
      config.jwt.refreshSecret as string
    ) as TokenPayload
  } catch {
    throw new AuthenticationError('Invalid or expired refresh token')
  }
}

/* ================= REFRESH TOKEN STORAGE ================= */
export const saveRefreshToken = async (
  userId: string,
  token: string,
  expiresAt: Date
): Promise<void> => {
  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt
    }
  })
}

export const deleteRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { token }
  })
}

export const deleteAllUserRefreshTokens = async (
  userId: string
): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { userId }
  })
}

export const findRefreshToken = async (token: string) => {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true }
  })
}
