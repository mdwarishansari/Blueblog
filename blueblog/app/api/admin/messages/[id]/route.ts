import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth()
  if (!['ADMIN', 'EDITOR'].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  await prisma.contactMessage.update({
    where: { id: params.id },
    data: { isRead: true },
  })

  return NextResponse.json({ message: 'Marked as read' })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  await prisma.contactMessage.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ message: 'Message deleted' })
}
