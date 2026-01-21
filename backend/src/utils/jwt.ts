import jwt, { SignOptions, Secret } from 'jsonwebtoken'
import type { StringValue } from 'ms'

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

const accessSecret = process.env.JWT_ACCESS_SECRET as Secret
const refreshSecret = process.env.JWT_REFRESH_SECRET as Secret

if (!accessSecret || !refreshSecret) {
  throw new Error('JWT secrets are not defined in environment variables')
}

export const generateAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
  expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN || '1d') as StringValue,
}


  return jwt.sign(payload, accessSecret, options)
}

export const generateRefreshToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
  expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as StringValue,
}


  return jwt.sign(payload, refreshSecret, options)
}

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, accessSecret) as JwtPayload
}

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, refreshSecret) as JwtPayload
}
