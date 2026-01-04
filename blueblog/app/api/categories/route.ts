import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  imageId: z.string().optional(),
})

// Get all categories (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const withPosts = searchParams.get('withPosts') === 'true'

    const categories = await prisma.category.findMany({
      include: {
        image: true,
        ...(withPosts && {
          posts: {
            where: {
              status: 'PUBLISHED',
              publishedAt: { lte: new Date() },
            },
            take: 5,
            orderBy: { publishedAt: 'desc' },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
        }),
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// Create category (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = categorySchema.parse(body)

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: data.slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        { message: 'A category with this slug already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        imageId: data.imageId,
      },
      include: {
        image: true,
      },
    })

    return NextResponse.json({
      message: 'Category created successfully',
      category,
    })
  } catch (error) {
    console.error('Create category error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to create category' },
      { status: 500 }
    )
  }
}