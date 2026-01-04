import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

const imageSchema = z.object({
  url: z.string().url('Invalid URL'),
  altText: z.string().optional(),
  title: z.string().optional(),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { altText: { contains: search, mode: 'insensitive' } },
            { title: { contains: search, mode: 'insensitive' } },
            { caption: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.image.count({ where }),
    ])

    return NextResponse.json({
      images,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get images error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(['ADMIN', 'EDITOR'])

    const body = await request.json()
    const data = imageSchema.parse(body)

    const image = await prisma.image.create({
      data: {
        url: data.url,
        altText: data.altText,
        title: data.title,
        caption: data.caption,
        width: data.width,
        height: data.height,
      },
    })

    return NextResponse.json({
      message: 'Image created successfully',
      image,
    })
  } catch (error) {
    console.error('Create image error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to create image' },
      { status: 500 }
    )
  }
}