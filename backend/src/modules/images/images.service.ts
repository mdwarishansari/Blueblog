import prisma from '../../config/database';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary';
import { NotFoundError } from '../../utils/appError';

export class ImagesService {
  async uploadImage(file: Express.Multer.File, data: {
    altText?: string;
    title?: string;
    caption?: string;
  }) {
    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(file);

    // Save to database
    const image = await prisma.image.create({
      data: {
        url: cloudinaryResult.secure_url,
        altText: data.altText,
        title: data.title,
        caption: data.caption,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height
      }
    });

    return image;
  }

  async getImages(filters: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const { page, limit, search } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { altText: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prisma.image.count({ where });

    // Get images
    const images = await prisma.image.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const totalPages = Math.ceil(total / limit);

    return {
      images,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async getImageById(id: string) {
    const image = await prisma.image.findUnique({
      where: { id }
    });

    if (!image) {
      throw new NotFoundError('Image');
    }

    return image;
  }

  async updateImage(id: string, data: {
    altText?: string;
    title?: string;
    caption?: string;
  }) {
    // Check if image exists
    const image = await prisma.image.findUnique({
      where: { id }
    });

    if (!image) {
      throw new NotFoundError('Image');
    }

    // Update image
    const updatedImage = await prisma.image.update({
      where: { id },
      data
    });

    return updatedImage;
  }

  async deleteImage(id: string) {
    // Check if image exists
    const image = await prisma.image.findUnique({
      where: { id }
    });

    if (!image) {
      throw new NotFoundError('Image');
    }

    // Extract public_id from URL (format: https://res.cloudinary.com/cloudname/image/upload/v1234567890/folder/public_id.jpg)
    const urlParts = image.url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = urlParts[urlParts.length - 2];
    const fullPublicId = folder ? `${folder}/${publicId}` : publicId;

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(fullPublicId);
    } catch (error) {
      console.error('Failed to delete from Cloudinary:', error);
      // Continue with DB deletion even if Cloudinary fails
    }

    // Delete from database
    await prisma.image.delete({
      where: { id }
    });

    return { message: 'Image deleted successfully' };
  }
}