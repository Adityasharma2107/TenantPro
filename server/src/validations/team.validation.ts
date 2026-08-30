import { z } from 'zod';

const teamPasswordSchema = z
  .string()
  .min(8, 'Password must contain at least 8 characters.')
  .max(72, 'Password must contain at most 72 characters.')
  .regex(/[A-Z]/, 'Password must include one uppercase letter.')
  .regex(/[a-z]/, 'Password must include one lowercase letter.')
  .regex(/[0-9]/, 'Password must include one number.');

// Managers create tenant and technician accounts; managers cannot create another manager.
export const createTeamMemberSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must contain at least 2 characters.').max(80),
    email: z.string().trim().email('Enter a valid email address.'),
    password: teamPasswordSchema,
    role: z.enum(['tenant', 'technician']),
    unitNumber: z.string().trim().min(1, 'Unit number is required for a tenant.').max(30).optional(),
    specialization: z.string().trim().min(2).max(80).optional(),
  })
  .superRefine((data, context) => {
    if (data.role === 'tenant' && !data.unitNumber) {
      context.addIssue({
        code: 'custom',
        path: ['unitNumber'],
        message: 'Unit number is required for a tenant.',
      });
    }
  });
