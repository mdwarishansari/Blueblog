// lib/cloudinary.server.ts
import cloudinary from './cloudinary'

export async function deleteFromCloudinary(url: string) {
  const publicId = url.split('/').pop()!.split('.')[0]
  await cloudinary.uploader.destroy(publicId)
}
