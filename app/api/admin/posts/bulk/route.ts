import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)),
  action: z.enum(['DELETE', 'PUBLISH', 'DRAFT']),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ids, action } = bulkSchema.parse(body)

    const user = await requireAuth()

if (user.role === 'WRITER' && action !== 'DELETE') {
  return NextResponse.json(
    { message: 'Writers cannot bulk publish' },
    { status: 403 }
  )
}
if (user.role === 'WRITER') {
  await prisma.post.deleteMany({
    where: {
      id: { in: ids },
      authorId: user.id,
    },
  })
  return NextResponse.json({ success: true })
}

    if (action === 'DELETE') {
      await prisma.post.deleteMany({
        where: { id: { in: ids } },
      })
    }

    if (action === 'PUBLISH') {
      await prisma.post.updateMany({
        where: { id: { in: ids } },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      })
    }

    if (action === 'DRAFT') {
      await prisma.post.updateMany({
        where: { id: { in: ids } },
        data: {
          status: 'DRAFT',
          publishedAt: null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: 'Bulk action failed' },
      { status: 400 }
    )
  }
}
