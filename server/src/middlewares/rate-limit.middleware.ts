import rateLimit from 'express-rate-limit';

// Limits repeated registration and login attempts to slow down password-guessing attacks.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again in 15 minutes.' },
});

// Protects media uploads from denial-of-service and storage exhaustion.
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Upload limit exceeded. Please wait a few minutes before uploading more images.' },
});

// General rate limiter across all standard API routes.
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' },
});
