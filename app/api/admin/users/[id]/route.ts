import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/* ===========================
   UPDATE USER
   =========================== */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await requireAuth()

    if (admin.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    if (!id) {
      return NextResponse.json(
        { message: 'Invalid user id' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { name, role } = body

    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // 🔒 ADMIN RULE: immutable
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { message: 'Admin user cannot be modified here' },
        { status: 400 }
      )
    }

    // 🔒 Allow only WRITER / EDITOR
    if (role && !['WRITER', 'EDITOR'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name,
        role,
      },
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user: updated,
    })
  } catch (err) {
    console.error('Update user error:', err)
    return NextResponse.json(
      { message: 'Failed to update user' },
      { status: 500 }
    )
  }
}

/* ===========================
   DELETE USER
   =========================== */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await requireAuth()

    if (admin.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    if (!id) {
      return NextResponse.json(
        { message: 'Invalid user id' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // 🔒 ADMIN RULE: cannot be deleted
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { message: 'Admin user cannot be deleted' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'User deleted successfully',
    })
  } catch (err) {
    console.error('Delete user error:', err)
    return NextResponse.json(
      { message: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
