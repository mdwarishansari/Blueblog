import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});


export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder = 'blog'
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error('Invalid file buffer'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
  {
    folder,
    resource_type: 'image',
    secure: true,
    timeout: 60000, // ✅ 60 seconds (CRITICAL)
    transformation: [
      { width: 1200, height: 630, crop: 'limit', quality: 'auto' }
    ],
  },

      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }

        if (!result) {
          return reject(new Error('Cloudinary returned empty result'));
        }

        resolve({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};


export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

export const generateImageUrl = (
  publicId: string,
  transformations?: any
): string => {
  return cloudinary.url(publicId, {
    ...transformations,
    secure: true,
    fetch_format: 'auto'
  });
};

export default cloudinary;