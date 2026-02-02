import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  content: z.any(),
  bannerImageId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  publishedAt: z.string().optional().transform(str => str ? new Date(str) : null),
})

// Get all posts (admin)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (category) {
      where.categories = {
        some: {
          id: category,
        },
      }
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Writers can only see their own posts
    if (user.role === 'WRITER') {
      where.authorId = user.id
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          bannerImage: true,
          categories: true,
        },
        orderBy: { createdAt: 'desc' },
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
  } catch (error: any) {
    console.error('Get admin posts error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// Create a new post
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!['ADMIN', 'EDITOR', 'WRITER'].includes(user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
const data = postSchema.parse(body)

/** 🔒 WRITER CANNOT PUBLISH */
if (user.role === 'WRITER' && data.status === 'PUBLISHED') {
  return NextResponse.json(
    { message: 'Writers can only create drafts.' },
    { status: 403 }
  )
}


    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: data.slug },
    })

    if (existingPost) {
      return NextResponse.json(
        { message: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    // Create post
    const post = await prisma.post.create({
  data: {
    title: data.title,
    slug: data.slug,
    content: data.content,
    authorId: user.id,
    status: data.status,

    ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
    ...(data.bannerImageId !== undefined && {
      bannerImageId: data.bannerImageId,
    }),
    ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
    ...(data.seoDescription !== undefined && {
      seoDescription: data.seoDescription,
    }),
    ...(data.canonicalUrl !== undefined && {
      canonicalUrl: data.canonicalUrl,
    }),
    ...(data.publishedAt !== undefined && {
      publishedAt: data.publishedAt,
    }),

    categories: {
      connect: data.categoryIds?.map(id => ({ id })) ?? [],
    },
  },
  include: {
    author: true,
    bannerImage: true,
    categories: true,
  },
})


    return NextResponse.json({
      message: 'Post created successfully',
      post,
    })
  } catch (error) {
    console.error('Create post error:', error)

    if (error instanceof z.ZodError) {
  return NextResponse.json(
    { message: 'Validation error', issues: error.issues },
    { status: 400 }
  )
}


    return NextResponse.json(
      { message: 'Failed to create post' },
      { status: 500 }
    )
  }
}