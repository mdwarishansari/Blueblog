import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { compare, hash } from 'bcryptjs'

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { currentPassword, newPassword } = await req.json()

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const ok = await compare(currentPassword, dbUser.passwordHash)
    if (!ok) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    const hashed = await hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashed },
    })

    return NextResponse.json({ message: 'Password updated' })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Failed to update password' },
      { status: 500 }
    )
  }
}
