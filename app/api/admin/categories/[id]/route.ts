import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'

import { deleteFromCloudinary } from '@/lib/cloudinary.server'

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  imageId: z.string().optional().nullable(),
})

/* -------- UPDATE -------- */
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  await requireAuth()
  const { id } = await ctx.params
  const body = schema.parse(await req.json())

  const category = await prisma.category.update({
    where: { id },
    data: {
  name: body.name,
  slug: body.slug,
  ...(body.imageId !== undefined && {
    imageId: body.imageId,
  }),
},

    include: {
      image: true,
      _count: { select: { posts: true } },
    },
  })

  return NextResponse.json({ message: 'Category updated', category })
}

/* -------- DELETE -------- */
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  await requireAuth()
  const { id } = await ctx.params

  const category = await prisma.category.findUnique({
    where: { id },
    include: { image: true },
  })

  if (!category) {
    return NextResponse.json({ message: 'Category not found' }, { status: 404 })
  }

  await prisma.category.delete({ where: { id } })

  if (category.image) {
    await deleteFromCloudinary(category.image.url)
    await prisma.image.delete({ where: { id: category.image.id } })
  }

  return NextResponse.json({ message: 'Category deleted' })
}
