import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import rateLimit from '@/lib/rate-limit'


const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
})

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
})

/* ---------------- PUBLIC: SEND MESSAGE ---------------- */
export async function POST(request: NextRequest) {
  try {
    const ip =
  request.headers.get('x-forwarded-for') ??
  request.headers.get('x-real-ip') ??
  '127.0.0.1'

    await limiter.check(5, ip)

    const body = await request.json()
    const data = contactSchema.parse(body)

    await prisma.contactMessage.create({ data })

    return NextResponse.json({ message: 'Message sent' })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
  { message: e.issues.at(0)?.message ?? 'Invalid input' },
  { status: 400 }
)

    }
    return NextResponse.json({ message: 'Failed to send message' }, { status: 500 })
  }
}

/* ---------------- ADMIN: LIST MESSAGES ---------------- */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    if (!['ADMIN', 'EDITOR'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const unread = searchParams.get('unread') === 'true'

    const messages = await prisma.contactMessage.findMany({
      where: unread ? { isRead: false } : {},
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ messages })
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
}
