import { PostStatus, UserRole } from '@prisma/client'

export function canTransition(
  from: PostStatus,
  to: PostStatus,
  role: UserRole
): boolean {
  // ADMIN / EDITOR
  if (role === 'ADMIN' || role === 'EDITOR') {
    return true
  }

  // WRITER rules
  if (role === 'WRITER') {
    if (from === 'DRAFT' && to === 'VERIFICATION_PENDING') return true
    if (from === 'DRAFT' && to === 'DRAFT') return true
  }

  return false
}
