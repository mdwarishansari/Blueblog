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

export async function authorizeUser(_userId: string, _postId: string, userRole: UserRole) {
  if (userRole === 'ADMIN' || userRole === 'EDITOR') {
    return true
  }
  
  // Frontend no longer has DB access. Ownership should be enforced by backend authz.
  // Keep a conservative default:
  return false
}