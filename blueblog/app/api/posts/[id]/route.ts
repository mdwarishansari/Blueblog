import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  content: z.any(),
  bannerImageId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  publishedAt: z.string().optional().transform(str => str ? new Date(str) : null),
  categoryIds: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { 
        id: params.id,
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
            profileImage: true,
          },
        },
        bannerImage: true,
        categories: true,
      },
    })

    if (!post) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = postSchema.parse(body)

    // Check if slug already exists (excluding current post)
    const existingPost = await prisma.post.findFirst({
      where: {
        slug: data.slug,
        id: { not: params.id },
      },
    })

    if (existingPost) {
      return NextResponse.json(
        { message: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        bannerImageId: data.bannerImageId,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        canonicalUrl: data.canonicalUrl,
        status: data.status,
        publishedAt: data.publishedAt,
        categories: {
          set: [],
          connect: data.categoryIds?.map(id => ({ id })) || [],
        },
      },
      include: {
        author: true,
        bannerImage: true,
        categories: true,
      },
    })

    return NextResponse.json({
      message: 'Post updated successfully',
      post,
    })
  } catch (error) {
    console.error('Update post error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.post.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json(
      { message: 'Failed to delete post' },
      { status: 500 }
    )
  }
}