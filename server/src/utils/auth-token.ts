import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

import { getJwtSecret } from '../config/auth.js';
import { userRoles, type UserRole } from '../models/User.model.js';

export interface AuthTokenUser {
  _id: Types.ObjectId;
  role: UserRole;
  property: Types.ObjectId;
}

export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
  propertyId: string;
}

const hasValidRole = (role: unknown): role is UserRole =>
  typeof role === 'string' && userRoles.includes(role as UserRole);

// Creates a signed token containing only the identity details needed for authorization.
export const createAccessToken = (user: AuthTokenUser): string => {
  return jwt.sign(
    { role: user.role, propertyId: user.property.toString() },
    getJwtSecret(),
    { subject: user._id.toString(), expiresIn: 7 * 24 * 60 * 60 },
  );
};

// Verifies a cookie token before its details are trusted by a protected route.
export const verifyAccessToken = (accessToken: string): AuthenticatedUser => {
  const payload = jwt.verify(accessToken, getJwtSecret());

  if (
    typeof payload === 'string' ||
    !payload.sub ||
    typeof payload.propertyId !== 'string' ||
    !hasValidRole(payload.role)
  ) {
    throw new Error('The access token does not have a valid TenantPro payload.');
  }

  return {
    userId: payload.sub,
    role: payload.role,
    propertyId: payload.propertyId,
  };
};
