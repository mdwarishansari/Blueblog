import { v2 as cloudinary } from 'cloudinary';
import { config } from './index';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder = 'blog'
): Promise<{
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  public_id: string;
}> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 1200, height: 630, crop: 'fill', quality: 'auto' },
          { fetch_format: 'auto' }
        ],
        format: 'auto' // Auto WebP/AVIF conversion
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.url,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            public_id: result.public_id
          });
        }
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

export default cloudinary;