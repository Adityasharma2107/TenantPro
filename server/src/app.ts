import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    message: 'TenantPro API is running.',
    status: 'ok',
  });
});

export default app;
