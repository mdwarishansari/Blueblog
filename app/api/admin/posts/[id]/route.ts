import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.any(),
  bannerImageId: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  publishedAt: z
    .string()
    .optional()
    .transform(v => (v ? new Date(v) : null)),
  categoryIds: z.array(z.string()).optional(),
})

/* ---------------- GET ---------------- */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        categories: true,
        bannerImage: true,
      },
    })

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    if (user.role === 'WRITER' && post.authorId !== user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(post)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

/* ---------------- PUT ---------------- */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()

const body = await req.json()
const data = postSchema.parse(body)

/** 🔒 WRITER CANNOT PUBLISH */
if (user.role === 'WRITER' && data.status === 'PUBLISHED') {
  return NextResponse.json(
    { message: 'You are not authorized to publish posts. Save as draft only.' },
    { status: 403 }
  )
}


    const existing = await prisma.post.findFirst({
      where: {
        slug: data.slug,
        id: { not: id },
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Slug already exists' },
        { status: 400 }
      )
    }

    const post = await prisma.post.update({
  where: { id },
  data: {
    title: data.title,
    slug: data.slug,
    content: data.content,
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
      set: [],
      connect: data.categoryIds?.map(cid => ({ id: cid })) ?? [],
    },
  },
  include: {
    categories: true,
    bannerImage: true,
  },
})


    return NextResponse.json({ post })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Failed to update post' },
      { status: 500 }
    )
  }
}

/* ---------------- DELETE ---------------- */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    })

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    if (user.role === 'WRITER' && post.authorId !== user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    await prisma.post.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
