import { z } from 'zod';

export const updatePropertySchema = z.object({
  name: z.string().trim().min(2, 'Property name must contain at least 2 characters.').max(120).optional(),
  address: z
    .object({
      line1: z.string().trim().min(3, 'Address is required.').max(160),
      city: z.string().trim().min(2, 'City is required.').max(80),
      state: z.string().trim().min(2, 'State is required.').max(80),
      postalCode: z.string().trim().min(3, 'Postal code is required.').max(20),
    })
    .optional(),
  unitCount: z.coerce.number().int().min(1, 'Unit count must be at least 1.').max(10000).optional(),
  contactEmail: z.string().trim().email('Enter a valid contact email.').optional().or(z.literal('')),
});
