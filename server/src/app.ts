import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';

import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { apiRateLimiter } from './middlewares/rate-limit.middleware.js';
import analyticsRouter from './routes/analytics.routes.js';
import authRouter from './routes/auth.routes.js';
import teamRouter from './routes/team.routes.js';
import ticketRouter from './routes/ticket.routes.js';
import uploadRouter from './routes/upload.routes.js';

const app = express();

// Adds security-related HTTP response headers, permitting cross-origin media rendering.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

const getAllowedOrigins = (): string[] => {
  if (!process.env.CLIENT_URL) return ['http://localhost:5173'];
  return process.env.CLIENT_URL.split(',').map((url) => url.trim());
};

// Allows the React application to call this API and send authentication cookies later.
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || getAllowedOrigins().includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);

// Global rate limiter across API paths to mitigate abuse.
app.use('/api', apiRateLimiter);

// Converts JSON request bodies into JavaScript objects for API routes.
app.use(express.json());

// Reads the HTTP-only authentication cookie sent by the browser.
app.use(cookieParser());

// A small endpoint used to confirm that the API process is alive.
app.get('/api/health', (_request, response) => {
  response.status(200).json({
    message: 'TenantPro API is running.',
    status: 'ok',
  });
});

// Groups all account-related endpoints under one consistent API path.
app.use('/api/auth', authRouter);

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
