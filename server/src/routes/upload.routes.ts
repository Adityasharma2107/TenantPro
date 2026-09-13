import { Router } from 'express';
import multer from 'multer';

import { uploadImages } from '../controllers/upload.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadRateLimiter } from '../middlewares/rate-limit.middleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // Maximum 5 images per request
  },
  fileFilter: (_request, file, callback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Only JPG, PNG, WebP, and GIF image files are permitted.'));
    }
  },
});

const uploadRouter = Router();

uploadRouter.post(
  '/',
  requireAuth,
  uploadRateLimiter,
  upload.array('images', 5),
  uploadImages,
);

export default uploadRouter;
