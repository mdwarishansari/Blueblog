import prisma from '../utils/prisma'
import { AppError } from '../middlewares/error.middleware'
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary'

export class MediaService {
  async uploadImage(fileBuffer: Buffer, filename: string, userId: string) {
    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(fileBuffer)

    // Save to database
    const image = await prisma.image.create({
      data: {
        url: uploadResult.url,
        altText: filename,
        title: filename,
        width: uploadResult.width,
        height: uploadResult.height,
      },
    })

    return {
      id: image.id,
      url: image.url,
      altText: image.altText,
      width: image.width,
      height: image.height,
      createdAt: image.createdAt,
    }
  }

  async getAllImages(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.image.count(),
    ])

    return {
      data: images,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  async getImageById(id: string) {
    const image = await prisma.image.findUnique({
      where: { id },
    })

    if (!image) {
      throw new AppError('Image not found', 404)
    }

    return image
  }

  async deleteImage(id: string) {
    // Check if image exists
    const image = await prisma.image.findUnique({
      where: { id },
      include: {
        posts: {
          take: 1,
        },
        categories: {
          take: 1,
        },
      },
    })

    if (!image) {
      throw new AppError('Image not found', 404)
    }

    // Check if image is being used
    if (image.posts.length > 0 || image.categories.length > 0) {
      throw new AppError('Cannot delete image that is in use', 400)
    }

    // Extract public_id from Cloudinary URL
    const urlParts = image.url.split('/')
    const publicId = urlParts[urlParts.length - 1].split('.')[0]

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(publicId)
    } catch (error) {
      console.error('Failed to delete from Cloudinary:', error)
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database
    await prisma.image.delete({
      where: { id },
    })

    return { message: 'Image deleted successfully' }
  }

  async getImagesByUsage() {
    const images = await prisma.image.findMany({
      include: {
        _count: {
          select: {
            posts: true,
            categories: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return images
  }
}

export default new MediaService()