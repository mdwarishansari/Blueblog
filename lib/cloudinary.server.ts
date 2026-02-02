// lib/cloudinary.server.ts
import cloudinary from './cloudinary'

export async function deleteFromCloudinary(url: string) {
  if (!url) return

  const parts = url.split('/')
  const filename = parts[parts.length - 1]
  if (!filename) return

  const dotIndex = filename.lastIndexOf('.')
  const publicId =
    dotIndex !== -1 ? filename.slice(0, dotIndex) : filename

  if (!publicId) return

  await cloudinary.uploader.destroy(publicId)
}
