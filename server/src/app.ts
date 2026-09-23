import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';

import { csrfProtection } from './middlewares/csrf.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { apiRateLimiter } from './middlewares/rate-limit.middleware.js';
import { sanitizeInput } from './middlewares/sanitize.middleware.js';
import analyticsRouter from './routes/analytics.routes.js';
import authRouter from './routes/auth.routes.js';
import notificationRouter from './routes/notification.routes.js';
import propertyRouter from './routes/property.routes.js';
import teamRouter from './routes/team.routes.js';
import ticketRouter from './routes/ticket.routes.js';
import uploadRouter from './routes/upload.routes.js';

const app = express();

// Trust reverse proxy (Vercel, Render, AWS, Fly.io) for secure cookies and protocol inspection
app.set('trust proxy', 1);

// Hide Express fingerprint to prevent targeted server scanner attacks
app.disable('x-powered-by');

// Adds comprehensive security HTTP response headers (CSP, HSTS, frame protection, anti-sniffing)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
);

const getAllowedOrigins = (): string[] => {
  if (!process.env.CLIENT_URL) return ['http://localhost:5173'];
  return process.env.CLIENT_URL.split(',').map((url) => url.trim());
};

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;
  const configured = getAllowedOrigins();
  if (configured.includes(origin)) return true;
  // Automatically whitelist Vercel deployments and localhost
  if (origin.endsWith('.vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return true;
  }
  return false;
};

// Allows the React application to call this API with strict CORS origin and header controls.
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-TenantPro-CSRF'],
    maxAge: 86400,
  }),
);

// Global rate limiter across API paths to mitigate denial-of-service and brute force abuse.
app.use('/api', apiRateLimiter);

// Payload size speed cap: rejects bloated payloads (1MB cap) to guard against memory exhaustion
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Input sanitization: strips MongoDB query operators ($ and .) and neutralizes script injection
app.use(sanitizeInput);

// Reads HTTP-only authentication cookies sent by verified clients
app.use(cookieParser());

// Anti-CSRF protection: validates custom headers and origins on state-changing requests
app.use('/api', csrfProtection);

// A small endpoint used to confirm that the API process is alive.
app.get('/api/health', (_request, response) => {
  response.status(200).json({
    message: 'TenantPro API is running.',
    status: 'ok',
  });
});

// Groups all account-related endpoints under one consistent API path.
app.use('/api/auth', authRouter);

// Access and manage property info and unit occupancy metrics.
app.use('/api/property', propertyRouter);
app.use('/api/properties', propertyRouter);

// User notification center for ticket actions and assignments.
app.use('/api/notifications', notificationRouter);

// Managers use this route group to create and list their residents and technicians.
app.use('/api/team', teamRouter);

// Holds the property-maintenance workflow from ticket creation through resolution.
app.use('/api/tickets', ticketRouter);

// Handles media attachments via Cloudinary with image validation.
app.use('/api/upload', uploadRouter);

// Computes operational metrics, turnaround speeds, and performance breakdowns.
app.use('/api/analytics', analyticsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
