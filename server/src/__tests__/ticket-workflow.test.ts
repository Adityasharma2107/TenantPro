import { Types } from 'mongoose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../app.js';
import { AUTH_COOKIE_NAME } from '../config/auth.js';
import { ActivityLog } from '../models/ActivityLog.model.js';
import { Comment } from '../models/Comment.model.js';
import { Ticket } from '../models/Ticket.model.js';
import { User } from '../models/User.model.js';
import { createAccessToken } from '../utils/auth-token.js';

describe('Ticket Lifecycle & Workflow Integration Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const propertyId = new Types.ObjectId();
  const tenantId = new Types.ObjectId();
  const managerId = new Types.ObjectId();
  const technicianId = new Types.ObjectId();

  const tenantToken = createAccessToken({
    _id: tenantId,
    role: 'tenant',
    property: propertyId,
  });

  const managerToken = createAccessToken({
    _id: managerId,
    role: 'manager',
    property: propertyId,
  });

  const technicianToken = createAccessToken({
    _id: technicianId,
    role: 'technician',
    property: propertyId,
  });

  describe('POST /api/tickets - Ticket Creation & Priority Logic', () => {
    it('creates ticket with tenant ownership and auto-assigned priority for plumbing category', async () => {
      const mockTicketId = new Types.ObjectId();

      vi.spyOn(Ticket, 'create').mockImplementationOnce(async (data: any) => ({
        _id: mockTicketId,
        ...data,
      }));

      vi.spyOn(ActivityLog, 'create').mockResolvedValueOnce({} as any);

      const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tenantToken}`])
        .send({
          title: 'Burst pipe under kitchen sink',
          description: 'Water is gushing out rapidly.',
          category: 'plumbing',
          location: 'Apt 4B',
          priority: 'high',
        });

      expect(response.status).toBe(201);
      expect(response.body.ticket).toMatchObject({
        _id: mockTicketId.toString(),
        title: 'Burst pipe under kitchen sink',
        category: 'plumbing',
        location: 'Apt 4B',
        priority: 'high',
        property: propertyId.toString(),
        tenant: tenantId.toString(),
      });
    });

    it('rejects ticket creation if title or description is missing', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tenantToken}`])
        .send({
          category: 'electrical',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PATCH /api/tickets/:ticketId/assignment - Technician Dispatch', () => {
    it('allows property manager to assign an active technician and updates status to assigned', async () => {
      const ticketId = new Types.ObjectId();
      const mockTicket: any = {
        _id: ticketId,
        title: 'AC not cooling',
        category: 'hvac',
        priority: 'high',
        status: 'open',
        property: propertyId,
        tenant: tenantId,
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(Ticket, 'findById').mockResolvedValueOnce(mockTicket);
      vi.spyOn(User, 'findOne').mockResolvedValueOnce({
        _id: technicianId,
        name: 'Bob the Builder',
        role: 'technician',
        property: propertyId,
        isActive: true,
      } as any);
      vi.spyOn(ActivityLog, 'create').mockResolvedValueOnce({} as any);

      const response = await request(app)
        .patch(`/api/tickets/${ticketId}/assignment`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${managerToken}`])
        .send({ technicianId: technicianId.toString() });

      expect(response.status).toBe(200);
      expect(mockTicket.assignedTechnician).toEqual(technicianId);
      expect(mockTicket.status).toBe('assigned');
      expect(mockTicket.save).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/tickets/:ticketId/status - Resolution Workflow', () => {
    it('allows assigned technician to mark ticket as resolved and sets resolvedAt timestamp', async () => {
      const ticketId = new Types.ObjectId();
      const mockTicket: any = {
        _id: ticketId,
        title: 'Heater thermostat replaced',
        category: 'heating',
        priority: 'high',
        status: 'in_progress',
        property: propertyId,
        tenant: tenantId,
        assignedTechnician: technicianId,
        resolvedAt: undefined,
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(Ticket, 'findById').mockResolvedValueOnce(mockTicket);
      vi.spyOn(ActivityLog, 'create').mockResolvedValueOnce({} as any);

      const response = await request(app)
        .patch(`/api/tickets/${ticketId}/status`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${technicianToken}`])
        .send({ status: 'resolved' });

      expect(response.status).toBe(200);
      expect(mockTicket.status).toBe('resolved');
      expect(mockTicket.resolvedAt).toBeDefined();
      expect(mockTicket.save).toHaveBeenCalled();
    });
  });

  describe('POST /api/tickets/:ticketId/comments - Discussion Thread', () => {
    it('allows tenant to add a comment to their ticket', async () => {
      const ticketId = new Types.ObjectId();
      const mockTicket = {
        _id: ticketId,
        title: 'Water leak',
        property: propertyId,
        tenant: tenantId,
      };

      vi.spyOn(Ticket, 'findById').mockResolvedValueOnce(mockTicket as any);
      vi.spyOn(Comment, 'create').mockResolvedValueOnce({
        _id: new Types.ObjectId(),
        ticket: ticketId,
        author: tenantId,
        message: 'The leak has stopped for now.',
        attachments: [],
        createdAt: new Date(),
        populate: vi.fn().mockImplementation(async function (this: any) {
          return this;
        }),
      } as any);
      vi.spyOn(ActivityLog, 'create').mockResolvedValueOnce({} as any);

      const response = await request(app)
        .post(`/api/tickets/${ticketId}/comments`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tenantToken}`])
        .send({ message: 'The leak has stopped for now.' });

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('Comment added successfully');
      expect(response.body.comment.message).toBe('The leak has stopped for now.');
    });
  });

  describe('GET /api/analytics - Operational Intelligence', () => {
    it('computes turnaround speeds, category distribution, and technician efficiency for managers', async () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const mockTickets = [
        {
          _id: new Types.ObjectId(),
          status: 'resolved',
          category: 'plumbing',
          createdAt: twoHoursAgo,
          resolvedAt: now,
          assignedTechnician: technicianId,
        },
        {
          _id: new Types.ObjectId(),
          status: 'open',
          category: 'electrical',
          createdAt: now,
        },
      ];

      const mockTechnicians = [
        {
          _id: technicianId,
          name: 'Bob the Builder',
          specialization: 'Plumbing',
        },
      ];

      vi.spyOn(Ticket, 'find').mockReturnValueOnce({
        lean: vi.fn().mockResolvedValueOnce(mockTickets),
      } as any);

      vi.spyOn(User, 'find').mockReturnValueOnce({
        lean: vi.fn().mockResolvedValueOnce(mockTechnicians),
      } as any);

      const response = await request(app)
        .get('/api/analytics')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${managerToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.summary.totalTickets).toBe(2);
      expect(response.body.summary.resolvedTickets).toBe(1);
      expect(response.body.summary.openTickets).toBe(1);
      expect(response.body.summary.avgResolutionHours).toBe(2);
      expect(response.body.byCategory).toHaveProperty('plumbing', 1);
      expect(response.body.byCategory).toHaveProperty('electrical', 1);
      expect(response.body.technicianLeaderboard).toHaveLength(1);
      expect(response.body.technicianLeaderboard[0]).toMatchObject({
        name: 'Bob the Builder',
        activeCount: 0,
        resolvedCount: 1,
      });
    });
  });
});
