import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must contain at least 8 characters.')
  .max(72, 'Password must contain at most 72 characters.')
  .regex(/[A-Z]/, 'Password must include one uppercase letter.')
  .regex(/[a-z]/, 'Password must include one lowercase letter.')
  .regex(/[0-9]/, 'Password must include one number.');

// Validates manager onboarding data before a user or property is written to MongoDB.
export const registerManagerSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters.').max(80),
  email: z.string().trim().email('Enter a valid email address.'),
  password: passwordSchema,
  property: z.object({
    name: z.string().trim().min(2, 'Property name must contain at least 2 characters.').max(120),
    address: z.object({
      line1: z.string().trim().min(3, 'Address is required.').max(160),
      city: z.string().trim().min(2, 'City is required.').max(80),
      state: z.string().trim().min(2, 'State is required.').max(80),
      postalCode: z.string().trim().min(3, 'Postal code is required.').max(20),
    }),
    unitCount: z.coerce.number().int().min(1, 'Unit count must be at least 1.').max(10000),
  }),
});

// Validates only the two details required to sign in.
export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});
