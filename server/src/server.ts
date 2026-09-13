import 'dotenv/config';
import http from 'node:http';

import app from './app.js';
import { connectDatabase } from './config/database.js';
import { initSocketServer } from './socket.js';

const port = Number(process.env.PORT ?? 5000);

// Starts MongoDB first so the API never accepts requests without a database connection.
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const httpServer = http.createServer(app);
    initSocketServer(httpServer);

    httpServer.listen(port, () => {
      console.log(`TenantPro API is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('TenantPro API could not start.', error);
    process.exit(1);
  }
};

// `void` explicitly marks this startup promise as intentionally not awaited at top level.
void startServer();
