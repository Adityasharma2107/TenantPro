import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';

import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import authRouter from './routes/auth.routes.js';
import teamRouter from './routes/team.routes.js';
import ticketRouter from './routes/ticket.routes.js';

const app = express();

// Adds security-related HTTP response headers to every API response.
app.use(helmet());

// Allows the React application to call this API and send authentication cookies later.
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  }),
);

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

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
