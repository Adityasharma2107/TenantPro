import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

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

// A small endpoint used to confirm that the API process is alive.
app.get('/api/health', (_request, response) => {
  response.status(200).json({
    message: 'TenantPro API is running.',
    status: 'ok',
  });
});

export default app;
