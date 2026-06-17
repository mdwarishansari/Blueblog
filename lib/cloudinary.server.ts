// lib/cloudinary.server.ts
import { getCloudinary } from './cloudinary'

export async function deleteFromCloudinary(url: string) {
  if (!url) return

  // Extract public ID including nested folders
  // Cloudinary URLs look like: .../image/upload/[v123456/][folder]/[public_id].[ext]
  const uploadIndex = url.indexOf('/image/upload/')
  if (uploadIndex === -1) return

  let pathAndFilename = url.substring(uploadIndex + '/image/upload/'.length)
  
  // Remove version prefix if present, e.g. "v12345678/"
  pathAndFilename = pathAndFilename.replace(/^v\d+\//, '')

  // Remove file extension
  const dotIndex = pathAndFilename.lastIndexOf('.')
  const publicId = dotIndex !== -1 ? pathAndFilename.slice(0, dotIndex) : pathAndFilename

  if (!publicId) return

  const cloudinary = getCloudinary()
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    console.log(`Cloudinary destroy result for ${publicId}:`, result)
    return result
  } catch (error) {
    console.error(`Failed to destroy Cloudinary image ${publicId}:`, error)
  }
}
