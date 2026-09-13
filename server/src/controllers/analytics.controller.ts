import type { RequestHandler } from 'express';
import type { QueryFilter } from 'mongoose';
import { Ticket, type ITicket } from '../models/Ticket.model.js';
import { User } from '../models/User.model.js';

export const getAnalytics: RequestHandler = async (request, response) => {
  const user = request.user!;
  const filter: QueryFilter<ITicket> = { property: user.propertyId };

  if (user.role === 'tenant') {
    filter.tenant = user.userId;
  } else if (user.role === 'technician') {
    filter.assignedTechnician = user.userId;
  }

  const tickets = await Ticket.find(filter).lean();

  const totalTickets = tickets.length;
  const byStatus: Record<string, number> = {
    open: 0,
    assigned: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  };

  const byPriority: Record<string, number> = {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    unassigned: 0,
  };

  const byCategory: Record<string, number> = {
    plumbing: 0,
    electrical: 0,
    appliance: 0,
    internet: 0,
    security: 0,
    cleaning: 0,
    other: 0,
  };

  let totalResolutionHours = 0;
  let resolvedWithDatesCount = 0;

  for (const t of tickets) {
    if (byStatus[t.status] !== undefined) byStatus[t.status]++;
    if (byPriority[t.priority] !== undefined) byPriority[t.priority]++;
    if (byCategory[t.category] !== undefined) byCategory[t.category]++;

    if ((t.status === 'resolved' || t.status === 'closed') && t.resolvedAt) {
      const created = new Date(t.createdAt).getTime();
      const resolved = new Date(t.resolvedAt).getTime();
      const diffHours = Math.max(0.1, (resolved - created) / (1000 * 60 * 60));
      totalResolutionHours += diffHours;
      resolvedWithDatesCount++;
    }
  }

  const avgResolutionHours =
    resolvedWithDatesCount > 0
      ? Number((totalResolutionHours / resolvedWithDatesCount).toFixed(1))
      : 0;

  const resolvedTotal = byStatus.resolved + byStatus.closed;
  const healthScore = totalTickets > 0 ? Math.round((resolvedTotal / totalTickets) * 100) : 100;

  let technicianLeaderboard: Array<{
    id: string;
    name: string;
    specialization?: string;
    activeCount: number;
    resolvedCount: number;
  }> = [];

  if (user.role === 'manager') {
    const technicians = await User.find({
      property: user.propertyId,
      role: 'technician',
      isActive: true,
    }).lean();

    technicianLeaderboard = technicians.map((tech) => {
      const techTickets = tickets.filter(
        (t) => t.assignedTechnician?.toString() === tech._id.toString(),
      );
      const resolved = techTickets.filter(
        (t) => t.status === 'resolved' || t.status === 'closed',
      ).length;
      const active = techTickets.length - resolved;

      return {
        id: tech._id.toString(),
        name: tech.name,
        specialization: tech.specialization,
        activeCount: active,
        resolvedCount: resolved,
      };
    });
  }

  return response.status(200).json({
    summary: {
      totalTickets,
      openTickets: byStatus.open,
      inProgressTickets: byStatus.in_progress,
      resolvedTickets: byStatus.resolved,
      closedTickets: byStatus.closed,
      avgResolutionHours,
      healthScore,
    },
    byStatus,
    byPriority,
    byCategory,
    technicianLeaderboard,
  });
};
