import path from 'path';
import { Router, type RequestHandler } from 'express';
import multer, { MulterError } from 'multer';

import { uploadImages } from '../controllers/upload.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadRateLimiter } from '../middlewares/rate-limit.middleware.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file max
    files: 5, // Maximum 5 images per request
    fields: 5,
  },
  fileFilter: (_request, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
      callback(null, true);
    } else {
      callback(new Error('Only valid JPG, PNG, WebP, and GIF images up to 5MB are permitted.'));
    }
  },
});

const uploadMiddleware: RequestHandler = (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err instanceof MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum image size is 5MB.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Too many files. Maximum 5 images permitted.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ message: err.message || 'Invalid upload request.' });
    }
    next();
  });
};

const uploadRouter = Router();

uploadRouter.post(
  '/',
  requireAuth,
  uploadRateLimiter,
  uploadMiddleware,
  uploadImages,
);

export default uploadRouter;
