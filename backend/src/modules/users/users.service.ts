import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/appError';
import { config } from '../../config';

export class UsersService {
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: string;
    bio?: string;
    profileImage?: string;
  }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
  data: {
    name: data.name,
    email: data.email,
    role: data.role,
    bio: data.bio,
    profileImage: data.profileImage,
    passwordHash: hashedPassword, // ✅ ONLY THIS
  },
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    bio: true,
    profileImage: true,
    createdAt: true,
    updatedAt: true,
  },
});


    return user;
  }

  async getUsers(filters: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
  }) {
    const { page, limit, search, role } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) {
      where.role = role;
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { posts: true }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        posts: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            publishedAt: true
          },
          take: 10,
          orderBy: { publishedAt: 'desc' }
        }
      }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async updateUser(id: string, data: {
    name?: string;
    role?: string;
    bio?: string;
    profileImage?: string;
  }) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new NotFoundError('User');
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  }

  async deleteUser(id: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Prevent deleting self if needed
    // You can add this check based on your requirements

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    return { message: 'User deleted successfully' };
  }
}