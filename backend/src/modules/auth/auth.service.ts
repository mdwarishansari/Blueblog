import bcrypt from 'bcryptjs';
import { addDays } from 'date-fns';
import prisma from '../../config/database';

import {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  deleteRefreshToken,
  verifyRefreshToken,
  TokenPayload,
  deleteAllUserRefreshTokens
} from '../../config/auth';
import { AuthenticationError, NotFoundError } from '../../utils/appError';

export class AuthService {

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        profileImage: true,
        bio: true
      }
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token to database
    const expiresAt = addDays(new Date(), 7); // 7 days from now
    await saveRefreshToken(user.id, refreshToken, expiresAt);

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword
    };
  }

  async refreshToken(refreshToken: string) {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!tokenRecord) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      await deleteRefreshToken(refreshToken);
      throw new AuthenticationError('Refresh token expired');
    }

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      userId: tokenRecord.userId,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Delete old refresh token and save new one
    await deleteRefreshToken(refreshToken);
    const expiresAt = addDays(new Date(), 7);
    await saveRefreshToken(tokenRecord.userId, newRefreshToken, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  async logout(refreshToken: string) {
    await deleteRefreshToken(refreshToken);
  }

  async logoutAll(userId: string) {
    await deleteAllUserRefreshTokens(userId);
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profileImage: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword }
    });

    // Logout from all devices
    await this.logoutAll(userId);

    return { message: 'Password changed successfully' };
  }
}