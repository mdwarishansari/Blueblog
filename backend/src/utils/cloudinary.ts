import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  url: string
  public_id: string
  width: number
  height: number
  format: string
}

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  mimeType: string,
  folder = 'blueblog'
): Promise<UploadResult> => {
  const base64 = fileBuffer.toString('base64')

  const result = await cloudinary.uploader.upload(
    `data:${mimeType};base64,${base64}`,
    {
      folder,
      resource_type: 'image',
      timeout: 60_000,
      transformation: [
        { width: 2000, height: 2000, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    }
  )

  return {
    url: result.secure_url,
    public_id: result.public_id,
    width: result.width!,
    height: result.height!,
    format: result.format!,
  }
}



export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId)
}

export default cloudinary