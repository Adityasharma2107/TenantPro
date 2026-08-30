import type { QueryFilter } from 'mongoose';
import { Types } from 'mongoose';
import type { RequestHandler } from 'express';

import { ActivityLog } from '../models/ActivityLog.model.js';
import { Comment } from '../models/Comment.model.js';
import { Ticket, type ITicket, type TicketStatus } from '../models/Ticket.model.js';
import { User } from '../models/User.model.js';
import {
  addCommentSchema,
  assignTechnicianSchema,
  createTicketSchema,
  ticketListQuerySchema,
  updatePrioritySchema,
  updateStatusSchema,
} from '../validations/ticket.validation.js';

const technicianStatuses: TicketStatus[] = ['in_progress', 'resolved'];

const isSameId = (left: { toString(): string } | string | undefined, right: string): boolean =>
  left?.toString() === right;

// Adds an audit event so the ticket timeline explains who performed an action.
const addActivity = async (
  ticketId: Types.ObjectId,
  actorId: string,
  type: Parameters<typeof ActivityLog.create>[0]['type'],
  description: string,
): Promise<void> => {
  await ActivityLog.create({ ticket: ticketId, actor: actorId, type, description });
};

// Allows access only to a manager in the property, the reporting tenant, or the assigned technician.
const canAccessTicket = (ticket: ITicket, user: NonNullable<Express.Request['user']>): boolean => {
  if (user.role === 'manager') {
    return isSameId(ticket.property, user.propertyId);
  }

  if (user.role === 'tenant') {
    return isSameId(ticket.tenant, user.userId);
  }

  return isSameId(ticket.assignedTechnician, user.userId);
};

const findTicket = async (
  ticketId: string | string[] | undefined,
  response: Parameters<RequestHandler>[1],
) => {
  if (typeof ticketId !== 'string' || !Types.ObjectId.isValid(ticketId)) {
    response.status(400).json({ message: 'Ticket ID is invalid.' });
    return undefined;
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    response.status(404).json({ message: 'Ticket was not found.' });
    return undefined;
  }

  return ticket;
};

// Tenants can report an issue; their property and identity always come from the signed-in session.
export const createTicket: RequestHandler = async (request, response) => {
  const result = createTicketSchema.safeParse(request.body);

  if (!result.success) {
    return response.status(400).json({
      message: 'Please correct the ticket details.',
      errors: result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    });
  }

  const data = result.data;
  const ticket = await Ticket.create({
    ...data,
    priority: data.priority ?? 'unassigned',
    property: request.user!.propertyId,
    tenant: request.user!.userId,
  });

  await addActivity(ticket._id, request.user!.userId, 'ticket_created', 'Tenant reported this maintenance issue.');

  return response.status(201).json({ message: 'Ticket created successfully.', ticket });
};

// Lists tickets within the signed-in user's permitted property and role scope.
export const listTickets: RequestHandler = async (request, response) => {
  const result = ticketListQuerySchema.safeParse(request.query);

  if (!result.success) {
    return response.status(400).json({ message: 'One or more ticket filters are invalid.' });
  }

  const { status, priority, category, search, page, limit } = result.data;
  const filter: QueryFilter<ITicket> = { property: request.user!.propertyId };

  if (request.user!.role === 'tenant') {
    filter.tenant = request.user!.userId;
  }

  if (request.user!.role === 'technician') {
    filter.assignedTechnician = request.user!.userId;
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (search) {
    // Escaping the phrase prevents a normal search from being interpreted as a regular expression.
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
      { location: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('tenant', 'name email unitNumber')
      .populate('assignedTechnician', 'name email specialization')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Ticket.countDocuments(filter),
  ]);

  return response.status(200).json({
    tickets,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

// Loads the ticket, conversation, and activity timeline for the full ticket-details page.
export const getTicketById: RequestHandler = async (request, response) => {
  const ticket = await findTicket(request.params.ticketId, response);

  if (!ticket) return;
  if (!canAccessTicket(ticket, request.user!)) {
    return response.status(403).json({ message: 'You do not have access to this ticket.' });
  }

  const [ticketWithPeople, comments, activities] = await Promise.all([
    Ticket.findById(ticket._id)
      .populate('tenant', 'name email unitNumber')
      .populate('assignedTechnician', 'name email specialization'),
    Comment.find({ ticket: ticket._id }).populate('author', 'name role').sort({ createdAt: 1 }),
    ActivityLog.find({ ticket: ticket._id }).populate('actor', 'name role').sort({ createdAt: 1 }),
  ]);

  return response.status(200).json({ ticket: ticketWithPeople, comments, activities });
};

// Managers assign only an active technician from their own property.
export const assignTechnician: RequestHandler = async (request, response) => {
  const result = assignTechnicianSchema.safeParse(request.body);

  if (!result.success) {
    return response.status(400).json({ message: 'Choose a valid technician.' });
  }

  const ticket = await findTicket(request.params.ticketId, response);
  if (!ticket) return;
  if (!isSameId(ticket.property, request.user!.propertyId)) {
    return response.status(403).json({ message: 'You do not have access to this ticket.' });
  }

  const technician = await User.findOne({
    _id: result.data.technicianId,
    property: request.user!.propertyId,
    role: 'technician',
    isActive: true,
  });

  if (!technician) {
    return response.status(400).json({ message: 'Choose an active technician from this property.' });
  }

  ticket.assignedTechnician = technician._id;
  if (ticket.status === 'open') ticket.status = 'assigned';
  await ticket.save();

  await addActivity(ticket._id, request.user!.userId, 'ticket_assigned', `Assigned to ${technician.name}.`);

  return response.status(200).json({ message: 'Technician assigned successfully.', ticket });
};

// Managers set a priority after reviewing ordinary maintenance categories.
export const updatePriority: RequestHandler = async (request, response) => {
  const result = updatePrioritySchema.safeParse(request.body);
  if (!result.success) return response.status(400).json({ message: 'Choose a valid priority.' });

  const ticket = await findTicket(request.params.ticketId, response);
  if (!ticket) return;
  if (!isSameId(ticket.property, request.user!.propertyId)) {
    return response.status(403).json({ message: 'You do not have access to this ticket.' });
  }

  ticket.priority = result.data.priority;
  await ticket.save();
  await addActivity(ticket._id, request.user!.userId, 'ticket_updated', `Priority changed to ${result.data.priority}.`);

  return response.status(200).json({ message: 'Ticket priority updated successfully.', ticket });
};

// Managers can set any status; an assigned technician can move work to in progress or resolved.
export const updateStatus: RequestHandler = async (request, response) => {
  const result = updateStatusSchema.safeParse(request.body);
  if (!result.success) return response.status(400).json({ message: 'Choose a valid ticket status.' });

  const ticket = await findTicket(request.params.ticketId, response);
  if (!ticket) return;
  if (!canAccessTicket(ticket, request.user!)) {
    return response.status(403).json({ message: 'You do not have access to this ticket.' });
  }
  if (request.user!.role === 'tenant') {
    return response.status(403).json({ message: 'Tenants cannot change ticket status.' });
  }
  if (request.user!.role === 'technician' && !technicianStatuses.includes(result.data.status)) {
    return response.status(403).json({ message: 'Technicians can only mark work in progress or resolved.' });
  }

  ticket.status = result.data.status;
  ticket.resolvedAt = result.data.status === 'resolved' ? new Date() : undefined;
  await ticket.save();

  const activityType = result.data.status === 'resolved'
    ? 'ticket_resolved'
    : result.data.status === 'closed'
      ? 'ticket_closed'
      : 'status_changed';
  await addActivity(ticket._id, request.user!.userId, activityType, `Status changed to ${result.data.status}.`);

  return response.status(200).json({ message: 'Ticket status updated successfully.', ticket });
};

// Adds a visible discussion message for anyone allowed to view the ticket.
export const addComment: RequestHandler = async (request, response) => {
  const result = addCommentSchema.safeParse(request.body);
  if (!result.success) return response.status(400).json({ message: 'Comment cannot be empty.' });

  const ticket = await findTicket(request.params.ticketId, response);
  if (!ticket) return;
  if (!canAccessTicket(ticket, request.user!)) {
    return response.status(403).json({ message: 'You do not have access to this ticket.' });
  }

  const comment = await Comment.create({
    ticket: ticket._id,
    author: request.user!.userId,
    message: result.data.message,
  });
  await addActivity(ticket._id, request.user!.userId, 'comment_added', 'Added a comment.');

  return response.status(201).json({ message: 'Comment added successfully.', comment });
};
