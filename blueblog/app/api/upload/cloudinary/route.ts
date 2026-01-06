import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/cloudinary.upload'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/auth'

// const uploadSchema = z.object({
//   altText: z.string().optional(),
//   title: z.string().optional(),
//   caption: z.string().optional(),
// })

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // Check if user has permission to upload images
    if (!['ADMIN', 'EDITOR', 'WRITER'].includes(user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const altText = formData.get('altText') as string || ''
    const title = formData.get('title') as string || ''
    const caption = formData.get('caption') as string || ''

    // Validate file
    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      )
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const uploadResult = await uploadImage(file, 'blueblog')

    // Store image metadata in database
    const image = await prisma.image.create({
      data: {
  url: uploadResult.url,
  ...(altText && { altText }),
  ...(title && { title }),
  ...(caption && { caption }),
  width: uploadResult.width,
  height: uploadResult.height,
},

    })

    return NextResponse.json({
      message: 'Image uploaded successfully',
      image: {
        id: image.id,
        url: image.url,
        altText: image.altText,
        title: image.title,
        caption: image.caption,
        width: image.width,
        height: image.height,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!['ADMIN', 'EDITOR', 'WRITER'].includes(user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    const where: Prisma.ImageWhereInput = search
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