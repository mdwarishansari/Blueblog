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

    const folderType = formData.get('folderType') as string || 'general'
    
    let targetFolder = 'blueblog'
    if (folderType === 'dp') targetFolder = 'blueblog/dp'
    else if (folderType === 'logo') targetFolder = 'blueblog/logo'
    else if (folderType === 'categories') targetFolder = 'blueblog/categories'
    else if (folderType === 'posts') targetFolder = 'blueblog/posts'
    else targetFolder = 'blueblog/general'

    // Upload to Cloudinary
    const uploadResult = await uploadImage(file, targetFolder)

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
    console.error('Upload error:')
    console.dir(error, { depth: null })

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
        include: {
          posts: {
            select: {
              title: true
            }
          },
          categories: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.image.count({ where }),
    ])

    const urls = images.map(img => img.url)

    // Fetch matching users
    const users = await prisma.user.findMany({
      where: {
        profileImage: {
          in: urls
        }
      },
      select: {
        name: true,
        profileImage: true
      }
    })

    // Fetch matching settings
    const settings = await prisma.setting.findMany({
      where: {
        key: 'site_logo',
        value: {
          in: urls
        }
      },
      select: {
        value: true
      }
    })

    // Fetch site name setting
    const siteNameSetting = await prisma.setting.findFirst({
      where: { key: 'site_name' },
      select: { value: true }
    })
    const siteName = siteNameSetting?.value || 'BlueBlog'

    const enrichedImages = images.map(img => {
      // 1. Profile Avatar
      const matchingUser = users.find(u => u.profileImage === img.url)
      if (matchingUser) {
        return {
          id: img.id,
          url: img.url,
          altText: img.altText,
          title: img.title,
          caption: img.caption,
          width: img.width,
          height: img.height,
          createdAt: img.createdAt,
          usageType: 'avatar',
          usageName: matchingUser.name,
          derivedTitle: `Avatar: ${matchingUser.name}`
        }
      }

      // 2. Site Logo
      const matchingSetting = settings.find(s => s.value === img.url)
      if (matchingSetting) {
        return {
          id: img.id,
          url: img.url,
          altText: img.altText,
          title: img.title,
          caption: img.caption,
          width: img.width,
          height: img.height,
          createdAt: img.createdAt,
          usageType: 'logo',
          usageName: siteName,
          derivedTitle: `Logo: ${siteName}`
        }
      }

      // 3. Category image
      if (img.categories && img.categories.length > 0 && img.categories[0]) {
        const catName = img.categories[0].name
        return {
          id: img.id,
          url: img.url,
          altText: img.altText,
          title: img.title,
          caption: img.caption,
          width: img.width,
          height: img.height,
          createdAt: img.createdAt,
          usageType: 'category',
          usageName: catName,
          derivedTitle: `Category: ${catName}`
        }
      }

      // 4. Post featured image
      if (img.posts && img.posts.length > 0 && img.posts[0]) {
        const postTitle = img.posts[0].title
        return {
          id: img.id,
          url: img.url,
          altText: img.altText,
          title: img.title,
          caption: img.caption,
          width: img.width,
          height: img.height,
          createdAt: img.createdAt,
          usageType: 'post',
          usageName: postTitle,
          derivedTitle: `Post: ${postTitle}`
        }
      }

      // 5. Default
      return {
        id: img.id,
        url: img.url,
        altText: img.altText,
        title: img.title,
        caption: img.caption,
        width: img.width,
        height: img.height,
        createdAt: img.createdAt,
        usageType: 'other',
        usageName: null,
        derivedTitle: img.title || 'Untitled Image'
      }
    })

    return NextResponse.json({
      images: enrichedImages,
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