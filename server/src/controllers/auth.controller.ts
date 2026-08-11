import bcrypt from 'bcryptjs';
import type { RequestHandler } from 'express';

import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  clearAuthCookieOptions,
} from '../config/auth.js';
import { Property } from '../models/Property.model.js';
import { User } from '../models/User.model.js';
import { createAccessToken } from '../utils/auth-token.js';
import { loginSchema, registerManagerSchema } from '../validations/auth.validation.js';

// Sends only safe user fields; password hashes must never be returned by an API.
const toPublicUser = (user: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: string;
  property: { toString(): string };
  isActive: boolean;
}) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  propertyId: user.property.toString(),
  isActive: user.isActive,
});

// Creates the first manager account and the property that account manages.
export const registerManager: RequestHandler = async (request, response) => {
  const result = registerManagerSchema.safeParse(request.body);

  if (!result.success) {
    return response.status(400).json({
      message: 'Please correct the highlighted registration details.',
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const { name, email, password, property } = result.data;
  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.exists({ email: normalizedEmail });

  if (existingUser) {
    return response.status(409).json({ message: 'An account already uses this email address.' });
  }

  // bcryptjs turns the password into a one-way hash before it reaches MongoDB.
  const passwordHash = await bcrypt.hash(password, 12);
  const createdProperty = await Property.create({
    ...property,
    contactEmail: normalizedEmail,
  });

  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: 'manager',
    property: createdProperty._id,
  });

  // Adds the manager reference after both records exist, avoiding a circular creation problem.
  createdProperty.manager = user._id;
  await createdProperty.save();

  const accessToken = createAccessToken(user);
  response.cookie(AUTH_COOKIE_NAME, accessToken, authCookieOptions);

  return response.status(201).json({
    message: 'Manager account created successfully.',
    user: toPublicUser(user),
    property: {
      id: createdProperty._id.toString(),
      name: createdProperty.name,
    },
  });
};

// Checks an email/password pair and issues a fresh HTTP-only login cookie.
export const login: RequestHandler = async (request, response) => {
  const result = loginSchema.safeParse(request.body);

  if (!result.success) {
    return response.status(400).json({ message: 'Enter a valid email address and password.' });
  }

  const user = await User.findOne({ email: result.data.email.toLowerCase() }).select('+passwordHash');
  const passwordMatches = user ? await bcrypt.compare(result.data.password, user.passwordHash) : false;

  if (!user || !passwordMatches || !user.isActive) {
    // A generic response avoids revealing whether a particular email address exists.
    return response.status(401).json({ message: 'Email or password is incorrect.' });
  }

  const accessToken = createAccessToken(user);
  response.cookie(AUTH_COOKIE_NAME, accessToken, authCookieOptions);

  return response.status(200).json({
    message: 'Logged in successfully.',
    user: toPublicUser(user),
  });
};

// Removes the browser cookie and ends the current session.
export const logout: RequestHandler = (_request, response) => {
  response.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
  return response.status(200).json({ message: 'Logged out successfully.' });
};

// Returns the logged-in account so the React app can restore a session after refresh.
export const getCurrentUser: RequestHandler = async (request, response) => {
  const user = await User.findById(request.user?.userId);

  if (!user || !user.isActive) {
    response.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
    return response.status(401).json({ message: 'Your session is no longer valid.' });
  }

  return response.status(200).json({ user: toPublicUser(user) });
};
