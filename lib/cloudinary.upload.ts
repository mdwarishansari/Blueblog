// lib/cloudinary.upload.ts
import cloudinary from './cloudinary'

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
  format: string
}

export async function uploadImage(
  file: File,
  folder = 'blueblog'
): Promise<UploadResult> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`

  const result = await cloudinary.uploader.upload(base64Image, {
    folder,
    resource_type: 'auto',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  }
}
