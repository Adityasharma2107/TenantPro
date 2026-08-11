import type { UserRole } from '../models/User.model.js';

declare global {
  namespace Express {
    // Adds the verified JWT details to requests that pass through requireAuth.
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
        propertyId: string;
      };
    }
  }
}

export {};
