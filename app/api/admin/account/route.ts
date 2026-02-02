import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/* -------- GET CURRENT USER -------- */
export async function GET() {
  try {
    const user = await requireAuth()

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
        bio: true,
        profileImage: true,
      },
    })

    return NextResponse.json(dbUser)
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
}

/* -------- UPDATE PROFILE -------- */
export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.name,
        email: body.email,
        bio: body.bio,
        profileImage: body.profileImage ?? null,
      },
    })

    return NextResponse.json({ message: 'Profile updated', user: updated })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
