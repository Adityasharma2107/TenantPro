import type { RequestHandler } from 'express';
import { uploadImageBuffer } from '../config/cloudinary.js';

/**
 * Uploads up to 5 image attachments to Cloudinary and returns secure URLs.
 */
export const uploadImages: RequestHandler = async (request, response) => {
  const files = request.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    return response.status(400).json({ message: 'Please select at least one image to upload.' });
  }

  try {
    const urls = await Promise.all(
      files.map((file) => uploadImageBuffer(file.buffer, file.mimetype)),
    );

    return response.status(200).json({
      message: 'Images uploaded successfully.',
      urls,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return response.status(500).json({ message: 'Failed to upload images. Please try again.' });
  }
};
