import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/* ---------- GET MESSAGES ---------- */
export async function GET() {
  try {
    const user = await requireAuth()
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ messages })
  } catch (e) {
    return NextResponse.json(
      { message: 'Failed to load messages' },
      { status: 500 }
    )
  }
}

/* ---------- MARK READ ---------- */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth()
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { id } = await req.json()

    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json({ message: 'Marked as read' })
  } catch {
    return NextResponse.json(
      { message: 'Failed to update message' },
      { status: 500 }
    )
  }
}

/* ---------- DELETE MESSAGE ---------- */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth()
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { id } = await req.json()

    await prisma.contactMessage.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Message deleted' })
  } catch {
    return NextResponse.json(
      { message: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
