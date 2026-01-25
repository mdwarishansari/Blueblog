import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  api_proxy: undefined,
})

export interface UploadResult {
  url: string
  public_id: string
  width: number
  height: number
  format: string
}

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  // mimeType: string,
  folder = 'blueblog'
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        timeout: 300_000, // 5 minutes (safe)
        transformation: [
          { width: 2000, height: 2000, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          console.error('❌ CLOUDINARY STREAM ERROR:', error)
          reject(
            new Error(
              error?.message ||
              'Cloudinary upload failed'
            )
          )
          return
        }

        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width!,
          height: result.height!,
          format: result.format!,
        })
      }
    )

    streamifier.createReadStream(fileBuffer).pipe(uploadStream)
  })
}

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId)
}

export default cloudinary
