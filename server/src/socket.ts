import type { Server as HttpServer } from 'node:http';
import { parseCookie } from 'cookie';
import { Server as SocketIOServer } from 'socket.io';

import { AUTH_COOKIE_NAME } from './config/auth.js';
import { verifyAccessToken, type AuthenticatedUser } from './utils/auth-token.js';

let io: SocketIOServer | null = null;

const getAllowedOrigins = (): string[] => {
  if (!process.env.CLIENT_URL) return ['http://localhost:5173'];
  return process.env.CLIENT_URL.split(',').map((url) => url.trim());
};

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;
  const configured = getAllowedOrigins();
  if (configured.includes(origin)) return true;
  if (origin.endsWith('.vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return true;
  }
  return false;
};

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Origin not allowed by Socket.io CORS'), false);
      },
      credentials: true,
    },
  });

  // Verify the HTTP-only authentication cookie during the WebSocket handshake
  io.use((socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) {
        return next(new Error('Authentication cookie is missing.'));
      }

      const parsed = parseCookie(rawCookie);
      const token = parsed[AUTH_COOKIE_NAME];
      if (!token) {
        return next(new Error('Authentication token is missing.'));
      }

      const user = verifyAccessToken(token);
      socket.data.user = user;
      return next();
    } catch {
      return next(new Error('Authentication failed.'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as AuthenticatedUser | undefined;
    if (user) {
      // Isolate users into their specific property room for multi-tenant broadcasts
      socket.join(`property:${user.propertyId}`);
      // Join direct user room for private dispatch/notifications
      socket.join(`user:${user.userId}`);
    }
  });

  return io;
};

export const getIO = (): SocketIOServer | null => io;

/**
 * Dispatches a ticket creation event to all users within the property.
 */
export const emitTicketCreated = (propertyId: string, ticket: unknown): void => {
  io?.to(`property:${propertyId}`).emit('ticket:created', { ticket });
};

/**
 * Dispatches a ticket update event (status, priority, assignment) to property members.
 */
export const emitTicketUpdated = (propertyId: string, ticket: unknown): void => {
  io?.to(`property:${propertyId}`).emit('ticket:updated', { ticket });
};

/**
 * Dispatches a new comment notification to all users following this property's tickets.
 */
export const emitCommentAdded = (
  propertyId: string,
  ticketId: string,
  comment: unknown,
): void => {
  io?.to(`property:${propertyId}`).emit('ticket:comment_added', { ticketId, comment });
};

/**
 * Dispatches a direct real-time notification to a specific user.
 */
export const emitNotification = (userId: string, notification: unknown): void => {
  io?.to(`user:${userId}`).emit('notification:new', { notification });
};

