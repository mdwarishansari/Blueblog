import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

/* -------------------- SCHEMA -------------------- */
const imageSchema = z.object({
  url: z.string().url('Invalid URL'),
  altText: z.string().optional(),
  title: z.string().optional(),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
})

/* -------------------- GET IMAGES -------------------- */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Number(searchParams.get('page') ?? 1)
    const limit = Number(searchParams.get('limit') ?? 50)
    const search = searchParams.get('search') ?? ''
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            {
              altText: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              title: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              caption: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
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

/* -------------------- CREATE IMAGE -------------------- */
export async function POST(request: NextRequest) {
  try {
    await requireAuth(['ADMIN', 'EDITOR'])

    const body = await request.json()
    const data = imageSchema.parse(body)

    const image = await prisma.image.create({
      data: {
        url: data.url,
        ...(data.altText && { altText: data.altText }),
        ...(data.title && { title: data.title }),
        ...(data.caption && { caption: data.caption }),
        ...(data.width && { width: data.width }),
        ...(data.height && { height: data.height }),
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
        { message: 'Validation error', errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to create image' },
      { status: 500 }
    )
  }
}
