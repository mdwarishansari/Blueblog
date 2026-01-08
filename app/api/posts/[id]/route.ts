import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

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

/* ------------------------------------------------------------------ */
/* GET (ADMIN / EDITOR / WRITER OWN POST)                              */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* PUT                                                                */
/* ------------------------------------------------------------------ */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requireAuth()

    const body = await req.json()
    const data = postSchema.parse(body)

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

    ...(data.excerpt && { excerpt: data.excerpt }),
    ...(data.bannerImageId !== undefined && {
      bannerImageId: data.bannerImageId,
    }),
    ...(data.seoTitle && { seoTitle: data.seoTitle }),
    ...(data.seoDescription && {
      seoDescription: data.seoDescription,
    }),
    ...(data.canonicalUrl && { canonicalUrl: data.canonicalUrl }),
    ...(data.publishedAt && { publishedAt: data.publishedAt }),

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
