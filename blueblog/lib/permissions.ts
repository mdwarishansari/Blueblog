import { UserRole } from '@prisma/client'

export const permissions = {
  canViewDashboard: (role: UserRole) => ['ADMIN', 'EDITOR', 'WRITER'].includes(role),
  canManageUsers: (role: UserRole) => role === 'ADMIN',
  canManageSettings: (role: UserRole) => role === 'ADMIN',
  canManagePosts: (role: UserRole) => ['ADMIN', 'EDITOR', 'WRITER'].includes(role),
  canEditAllPosts: (role: UserRole) => ['ADMIN', 'EDITOR'].includes(role),
  canPublishPosts: (role: UserRole) => ['ADMIN', 'EDITOR'].includes(role),
  canManageCategories: (role: UserRole) => ['ADMIN', 'EDITOR'].includes(role),
  canManageImages: (role: UserRole) => ['ADMIN', 'EDITOR', 'WRITER'].includes(role),
  canViewContactMessages: (role: UserRole) => ['ADMIN', 'EDITOR'].includes(role),
}

export function checkPermission(role: UserRole, permission: keyof typeof permissions): boolean {
  return permissions[permission](role)
}

export async function authorizeUser(userId: string, postId: string, userRole: UserRole) {
  if (userRole === 'ADMIN' || userRole === 'EDITOR') {
    return true
  }
  
  // For writers, check if they own the post
  const { prisma } = await import('./prisma')
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  })
  
  return post?.authorId === userId
}