import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
  format: string
}

export async function uploadImage(
  file: File,
  folder: string = 'blueblog'
): Promise<UploadResult> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          })
        }
      }
    )
    
    uploadStream.end(buffer)
  })
}

export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number
): string {
  if (!url.includes('cloudinary.com')) return url
  
  const transformations = []
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  transformations.push('c_fill', 'q_auto', 'f_auto')
  
  const baseUrl = url.replace('/upload/', `/upload/${transformations.join(',')}/`)
  return baseUrl
}