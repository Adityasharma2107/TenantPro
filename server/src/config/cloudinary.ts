import { v2 as cloudinary } from 'cloudinary';

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET,
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Uploads an image buffer to Cloudinary, or falls back to an embedded data URI
 * in local development environments where Cloudinary API keys are not provided.
 */
export const uploadImageBuffer = async (
  buffer: Buffer,
  mimetype: string,
  folder = 'tenantpro/tickets',
): Promise<string> => {
  if (!isCloudinaryConfigured) {
    // Development fallback ensures full offline functionality
    return `data:${mimetype};base64,${buffer.toString('base64')}`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error('Upload to Cloudinary failed.'));
        }
        resolve(result.secure_url);
      },
    );

    uploadStream.end(buffer);
  });
};
