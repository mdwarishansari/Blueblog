import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/* ---------------- PUBLIC: GET PUBLISHED POSTS ---------------- */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Number(searchParams.get('page') ?? 1)
    const limit = Number(searchParams.get('limit') ?? 12)
    const category = searchParams.get('category')
    const search = searchParams.get('search') ?? ''
    const skip = (page - 1) * limit

    const where: Prisma.PostWhereInput = {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },

      ...(category && {
        categories: {
          some: {
            slug: category,
          },
        },
      }),

      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            excerpt: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          bannerImage: true,
          categories: true,
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
