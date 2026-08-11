import type { RequestHandler } from 'express';

import { AUTH_COOKIE_NAME } from '../config/auth.js';
import type { UserRole } from '../models/User.model.js';
import { verifyAccessToken } from '../utils/auth-token.js';

// Rejects requests that do not contain a valid TenantPro login cookie.
export const requireAuth: RequestHandler = (request, response, next) => {
  const accessToken = request.cookies?.[AUTH_COOKIE_NAME];

  if (!accessToken) {
    return response.status(401).json({ message: 'Please log in to continue.' });
  }

  try {
    request.user = verifyAccessToken(accessToken);
    return next();
  } catch {
    return response.status(401).json({ message: 'Your session is invalid or has expired.' });
  }
};

// Restricts a route to specific roles, for example managers assigning technicians later.
export const authorizeRoles = (...allowedRoles: UserRole[]): RequestHandler => {
  return (request, response, next) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ message: 'You do not have permission to do this.' });
    }

    return next();
  };
};
