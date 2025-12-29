import { v2 as cloudinary } from 'cloudinary'
import { config } from './index'

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
})

export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder = 'blog'
): Promise<{
  url: string
  public_id: string
  width: number
  height: number
  format: string
}> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        timeout: 120000, // ✅ IMPORTANT
        transformation: [
          { width: 1200, height: 630, crop: 'limit', quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary upload failed:', error)
          return reject(error || new Error('Upload failed'))
        }

        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        })
      }
    )

    stream.end(file.buffer)
  })
}


export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId)
}

export default cloudinary
