import { model, Schema, Types } from 'mongoose';

export const ticketCategories = [
  'plumbing',
  'electrical',
  'appliance',
  'internet',
  'security',
  'cleaning',
  'other',
] as const;

export const ticketPriorities = ['unassigned', 'low', 'medium', 'high', 'urgent'] as const;
export const ticketStatuses = ['open', 'assigned', 'in_progress', 'resolved', 'closed'] as const;

export type TicketCategory = (typeof ticketCategories)[number];
export type TicketPriority = (typeof ticketPriorities)[number];
export type TicketStatus = (typeof ticketStatuses)[number];

export interface ITicket {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  location: string;
  imageUrls: string[];
  property: Types.ObjectId;
  tenant: Types.ObjectId;
  assignedTechnician?: Types.ObjectId;
  dueAt?: Date;
  resolvedAt?: Date;
}

// Stores one maintenance complaint from creation until it is resolved or closed.
const ticketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2_000 },
    category: { type: String, enum: ticketCategories, required: true },
    // Non-emergency categories begin unassigned until a manager reviews the ticket.
    priority: { type: String, enum: ticketPriorities, default: 'unassigned' },
    status: { type: String, enum: ticketStatuses, default: 'open' },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    imageUrls: { type: [String], default: [] },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTechnician: { type: Schema.Types.ObjectId, ref: 'User' },
    dueAt: { type: Date },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

// These indexes keep common dashboard and technician ticket queries fast.
ticketSchema.index({ property: 1, status: 1, priority: -1 });
ticketSchema.index({ tenant: 1, createdAt: -1 });
ticketSchema.index({ assignedTechnician: 1, status: 1 });

export const Ticket = model<ITicket>('Ticket', ticketSchema);
