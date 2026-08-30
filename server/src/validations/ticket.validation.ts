import { z } from 'zod';

import { ticketCategories, ticketPriorities, ticketStatuses } from '../models/Ticket.model.js';

const tenantPriorityCategories = ['plumbing', 'electrical', 'security'] as const;
const managerPriorities = ['low', 'medium', 'high', 'urgent'] as const;

// Tenants only set priority for categories that could require an urgent response.
export const createTicketSchema = z
  .object({
    title: z.string().trim().min(5, 'Title must contain at least 5 characters.').max(120),
    description: z.string().trim().min(10, 'Description must contain at least 10 characters.').max(2_000),
    category: z.enum(ticketCategories),
    location: z.string().trim().min(1, 'Unit number or location is required.').max(120),
    priority: z.enum(managerPriorities).optional(),
    imageUrls: z.array(z.string().url('Each image must be a valid URL.')).max(5).optional().default([]),
  })
  .superRefine((data, context) => {
    const canTenantSetPriority = tenantPriorityCategories.includes(
      data.category as (typeof tenantPriorityCategories)[number],
    );

    if (canTenantSetPriority && !data.priority) {
      context.addIssue({
        code: 'custom',
        path: ['priority'],
        message: 'Select a priority for plumbing, electrical, or security issues.',
      });
    }

    if (!canTenantSetPriority && data.priority) {
      context.addIssue({
        code: 'custom',
        path: ['priority'],
        message: 'A manager will set priority after reviewing this category.',
      });
    }
  });

export const assignTechnicianSchema = z.object({
  technicianId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Choose a valid technician.'),
});

export const updatePrioritySchema = z.object({
  priority: z.enum(managerPriorities),
});

export const updateStatusSchema = z.object({
  status: z.enum(ticketStatuses),
});

export const addCommentSchema = z.object({
  message: z.string().trim().min(1, 'Comment cannot be empty.').max(1_000),
});

// Validates optional list filters before they become part of a MongoDB query.
export const ticketListQuerySchema = z.object({
  status: z.enum(ticketStatuses).optional(),
  priority: z.enum(ticketPriorities).optional(),
  category: z.enum(ticketCategories).optional(),
  search: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
