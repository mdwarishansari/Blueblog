import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  imageId: z.string().nullable().optional(),
})

/* -------- CREATE -------- */
export async function POST(req: NextRequest) {
  await requireAuth()
  const body = schema.parse(await req.json())

  const exists = await prisma.category.findUnique({
    where: { slug: body.slug },
  })

  if (exists) {
    return NextResponse.json(
      { message: 'Slug already exists' },
      { status: 400 }
    )
  }

  const category = await prisma.category.create({
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

  return NextResponse.json({ message: 'Category created', category })
}
