import bcrypt from 'bcrypt'
import prisma from '../utils/prisma'
import { AppError } from '../middlewares/error.middleware'

export class UsersService {
  async getPublicTeamMembers() {
    // Publicly visible team members (no auth)
    return prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'EDITOR'] } },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        role: true,
        profileImage: true,
        createdAt: true,
      },
    })
  }

  async getAllUsers(currentUserId: string, currentUserRole: string) {
    // Writers can only see themselves
    if (currentUserRole === 'WRITER') {
      const user = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: this.getSafeUserFields(),
      })
      return [user]
    }

    // Admins and editors can see all users
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: this.getSafeUserFields(),
    })

    return users
  }

  async getUserById(id: string, currentUserId: string, currentUserRole: string) {
    // Check permissions
    if (currentUserRole === 'WRITER' && id !== currentUserId) {
      throw new AppError('You can only view your own profile', 403)
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: this.getSafeUserFields(),
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return user
  }

  async createUser(data: {
    name: string
    email: string
    password: string
    role: 'ADMIN' | 'EDITOR' | 'WRITER'
    bio?: string
    profileImage?: string
  }) {
    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new AppError('User with this email already exists', 409)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role,
        bio: data.bio,
        profileImage: data.profileImage,
      },
      select: this.getSafeUserFields(),
    })

    return user
  }

  async updateUser(
    id: string,
    data: {
      name?: string
      email?: string
      role?: 'ADMIN' | 'EDITOR' | 'WRITER'
      bio?: string
      profileImage?: string
    },
    currentUserId: string,
    currentUserRole: string
  ) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      throw new AppError('User not found', 404)
    }

    // Check permissions
    // Only admins can update roles and other users' profiles
    if (currentUserRole !== 'ADMIN') {
      if (id !== currentUserId) {
        throw new AppError('You can only update your own profile', 403)
      }
      // Non-admins can't change their role
      if (data.role && data.role !== existingUser.role) {
        throw new AppError('You cannot change your role', 403)
      }
    }

    // Check if new email exists
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      })
      if (emailExists) {
        throw new AppError('Email already in use', 409)
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: this.getSafeUserFields(),
    })

    return updatedUser
  }

  async deleteUser(id: string, currentUserId: string, currentUserRole: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          take: 1,
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Prevent deleting yourself
    if (id === currentUserId) {
      throw new AppError('You cannot delete your own account', 400)
    }

    // Prevent deleting admin if they're the only admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      })

      if (adminCount <= 1) {
        throw new AppError('Cannot delete the only admin user', 400)
      }
    }

    // Check if user has posts
    if (user._count.posts > 0) {
      throw new AppError('Cannot delete user that has posts', 400)
    }

    await prisma.user.delete({
      where: { id },
    })

    return { message: 'User deleted successfully' }
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string
      bio?: string
      profileImage?: string
    }
  ) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: this.getSafeUserFields(),
    })

    return updatedUser
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400)
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    })

    return { message: 'Password updated successfully' }
  }

  private getSafeUserFields() {
    return {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
    }
  }
}

export default new UsersService()