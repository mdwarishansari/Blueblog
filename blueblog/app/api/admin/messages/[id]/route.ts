import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/* -------- MARK AS READ -------- */
export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const user = await requireAuth()
  if (!['ADMIN', 'EDITOR'].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  await prisma.contactMessage.update({
    where: { id },
    data: { isRead: true },
  })

  return NextResponse.json({ message: 'Marked as read' })
}

/* -------- DELETE MESSAGE -------- */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  await prisma.contactMessage.delete({
    where: { id },
  })

  return NextResponse.json({ message: 'Message deleted' })
}
