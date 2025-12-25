import jwt from 'jsonwebtoken';
import { config } from './index';
import prisma from './database';
import { AuthenticationError } from '../utils/appError';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
};

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
  });
};

export const deleteRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { token }
  });
};

export const deleteAllUserRefreshTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { userId }
  });
};

export const findRefreshToken = async (token: string) => {
  return await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true }
  });
};