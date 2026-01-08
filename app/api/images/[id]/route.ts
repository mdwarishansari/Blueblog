import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { deleteFromCloudinary } from '@/lib/cloudinary.server'

/* ------------------------------------------------------------------ */
/* DELETE IMAGE (ADMIN ONLY)                                           */
/* ------------------------------------------------------------------ */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await requireAuth()

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      )
    }

    const image = await prisma.image.findUnique({
      where: { id },
    })

    if (!image) {
      return NextResponse.json(
        { message: 'Image not found' },
        { status: 404 }
      )
    }

    // ❗ prevent deleting used images
    const used = await prisma.post.findFirst({
      where: { bannerImageId: image.id },
      select: { id: true },
    })

    if (used) {
      return NextResponse.json(
        { message: 'Image is used by a post' },
        { status: 400 }
      )
    }

    // ☁️ Cloudinary
    await deleteFromCloudinary(image.url)

    // 🗑 DB
    await prisma.image.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Image deleted successfully' })
  } catch (err) {
    console.error('Delete image error:', err)
    return NextResponse.json(
      { message: 'Failed to delete image' },
      { status: 500 }
    )
  }
}

/* ------------------------------------------------------------------ */
/* UPDATE IMAGE METADATA                                               */
/* ------------------------------------------------------------------ */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requireAuth()

    const body = await req.json()

    const image = await prisma.image.update({
      where: { id },
      data: {
        altText: body.altText || null,
        title: body.title || null,
        caption: body.caption || null,
      },
    })

    return NextResponse.json({ image })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Failed to update image' },
      { status: 500 }
    )
  }
}
