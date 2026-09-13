import { Types } from 'mongoose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../app.js';
import { AUTH_COOKIE_NAME } from '../config/auth.js';
import { Ticket } from '../models/Ticket.model.js';
import { createAccessToken } from '../utils/auth-token.js';

describe('Multi-Tenant Isolation & RBAC Security Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Setup distinct properties, tenants, managers, and technicians
  const propertyOneId = new Types.ObjectId();
  const propertyTwoId = new Types.ObjectId();

  const tenantOneId = new Types.ObjectId();
  const tenantTwoId = new Types.ObjectId();

  const managerOneId = new Types.ObjectId();
  const managerTwoId = new Types.ObjectId();

  const techOneId = new Types.ObjectId();
  const techTwoId = new Types.ObjectId();

  const tokenTenantOne = createAccessToken({
    _id: tenantOneId,
    role: 'tenant',
    property: propertyOneId,
  });

  const tokenTenantTwo = createAccessToken({
    _id: tenantTwoId,
    role: 'tenant',
    property: propertyTwoId,
  });

  const tokenManagerTwo = createAccessToken({
    _id: managerTwoId,
    role: 'manager',
    property: propertyTwoId,
  });

  const tokenTechTwo = createAccessToken({
    _id: techTwoId,
    role: 'technician',
    property: propertyTwoId,
  });

  describe('IDOR & Cross-Property Ticket Isolation', () => {
    it('prevents Tenant 2 (Property 2) from accessing Ticket 1 (Property 1)', async () => {
      const ticketOneId = new Types.ObjectId();
      const mockTicketOne = {
        _id: ticketOneId,
        title: 'Broken Radiator',
        description: 'No heat coming out.',
        category: 'heating',
        priority: 'high',
        status: 'open',
        property: propertyOneId,
        tenant: tenantOneId,
        assignedTechnician: undefined,
      };

      vi.spyOn(Ticket, 'findById').mockResolvedValueOnce(mockTicketOne as any);

      const response = await request(app)
        .get(`/api/tickets/${ticketOneId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tokenTenantTwo}`]);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('do not have access');
    });

    it('prevents Tenant 2 from updating the status of Tenant 1 ticket', async () => {
      const ticketOneId = new Types.ObjectId();
      const mockTicketOne = {
        _id: ticketOneId,
        title: 'Leaking Sink',
        description: 'Water under sink.',
        category: 'plumbing',
        priority: 'high',
        status: 'open',
        property: propertyOneId,
        tenant: tenantOneId,
      };

      vi.spyOn(Ticket, 'findById').mockResolvedValueOnce(mockTicketOne as any);

      const response = await request(app)
        .patch(`/api/tickets/${ticketOneId}/status`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tokenTenantTwo}`])
        .send({ status: 'closed' });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('do not have access');
    });

    it('prevents Manager of Property 2 from assigning a technician to Property 1 ticket', async () => {
      const ticketOneId = new Types.ObjectId();
      const mockTicketOne = {
        _id: ticketOneId,
        title: 'Light switch sparks',
        description: 'Sparks when turned on.',
        category: 'electrical',
        priority: 'urgent',
        status: 'open',
        property: propertyOneId,
        tenant: tenantOneId,
      };

      vi.spyOn(Ticket, 'findById').mockResolvedValueOnce(mockTicketOne as any);

      const response = await request(app)
        .patch(`/api/tickets/${ticketOneId}/assignment`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tokenManagerTwo}`])
        .send({ technicianId: techTwoId.toString() });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('do not have access');
    });

    it('prevents an unassigned Technician from updating ticket status', async () => {
      const ticketOneId = new Types.ObjectId();
      const mockTicketOne = {
        _id: ticketOneId,
        title: 'AC unit failing',
        description: 'Warm air blowing.',
        category: 'hvac',
        priority: 'medium',
        status: 'assigned',
        property: propertyOneId,
        tenant: tenantOneId,
        assignedTechnician: techOneId, // assigned to Tech 1, not Tech 2
      };

      vi.spyOn(Ticket, 'findById').mockResolvedValueOnce(mockTicketOne as any);

      const response = await request(app)
        .patch(`/api/tickets/${ticketOneId}/status`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tokenTechTwo}`])
        .send({ status: 'in_progress' });

      expect(response.status).toBe(403);
    });
  });

  describe('Role-Based Access Control (RBAC) Barriers', () => {
    it('prevents Tenants from accessing Manager-only team management (POST /api/team)', async () => {
      const response = await request(app)
        .post('/api/team')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tokenTenantOne}`])
        .send({
          name: 'Bob Resident',
          email: 'bob@example.com',
          role: 'tenant',
          unitNumber: '4B',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('do not have permission');
    });

    it('prevents Tenants from accessing Manager-only analytics (GET /api/analytics)', async () => {
      const response = await request(app)
        .get('/api/analytics')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tokenTenantOne}`]);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('do not have permission');
    });

    it('prevents Technicians from creating team accounts (POST /api/team)', async () => {
      const response = await request(app)
        .post('/api/team')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tokenTechTwo}`])
        .send({
          name: 'Charlie Smith',
          email: 'charlie@example.com',
          role: 'technician',
          specialization: 'Plumber',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('do not have permission');
    });
  });
});
