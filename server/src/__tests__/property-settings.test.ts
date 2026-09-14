import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../app.js';
import { AUTH_COOKIE_NAME } from '../config/auth.js';
import { Property } from '../models/Property.model.js';
import { Ticket } from '../models/Ticket.model.js';
import { User } from '../models/User.model.js';
import { createAccessToken } from '../utils/auth-token.js';

describe('Property & Settings Integration Suite', () => {
  const propertyId = new Types.ObjectId();
  const managerId = new Types.ObjectId();
  const tenantId = new Types.ObjectId();

  const managerUser = {
    _id: managerId,
    name: 'Sarah Manager',
    email: 'sarah@tenantpro.com',
    role: 'manager' as const,
    property: propertyId,
    isActive: true,
  };

  const tenantUser = {
    _id: tenantId,
    name: 'Tom Tenant',
    email: 'tom@tenantpro.com',
    role: 'tenant' as const,
    property: propertyId,
    unitNumber: '4B',
    isActive: true,
  };

  const managerToken = createAccessToken(managerUser);
  const tenantToken = createAccessToken(tenantUser);

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/property', () => {
    it('returns 401 if unauthenticated', async () => {
      const response = await request(app).get('/api/property');
      expect(response.status).toBe(401);
    });

    it('returns property details and occupancy metrics for authorized user', async () => {
      const mockProperty = {
        _id: propertyId,
        name: 'Skyline Heights',
        address: {
          line1: '100 Panorama Way',
          city: 'Austin',
          state: 'TX',
          postalCode: '78701',
        },
        unitCount: 50,
        contactEmail: 'office@skyline.com',
        manager: { name: 'Sarah Manager', email: 'sarah@tenantpro.com' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(Property, 'findById').mockReturnValueOnce({
        populate: vi.fn().mockResolvedValueOnce(mockProperty),
      } as any);

      vi.spyOn(User, 'countDocuments')
        .mockResolvedValueOnce(30) // occupiedUnits
        .mockResolvedValueOnce(3); // technicianCount

      vi.spyOn(Ticket, 'countDocuments').mockResolvedValueOnce(5); // activeTickets

      const response = await request(app)
        .get('/api/property')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tenantToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.property.name).toBe('Skyline Heights');
      expect(response.body.stats).toEqual({
        totalUnits: 50,
        occupiedUnits: 30,
        vacantUnits: 20,
        occupancyRate: 60,
        technicianCount: 3,
        activeTicketsCount: 5,
      });
    });
  });

  describe('PATCH /api/property', () => {
    it('forbids tenant from updating property details with 403', async () => {
      const response = await request(app)
        .patch('/api/property')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tenantToken}`])
        .send({ name: 'Hacked Property' });

      expect(response.status).toBe(403);
    });

    it('allows manager to update property details', async () => {
      const mockPropertyDoc = {
        _id: propertyId,
        name: 'Skyline Heights',
        address: {
          line1: '100 Panorama Way',
          city: 'Austin',
          state: 'TX',
          postalCode: '78701',
        },
        unitCount: 50,
        contactEmail: 'office@skyline.com',
        manager: { name: 'Sarah Manager', email: 'sarah@tenantpro.com' },
        save: vi.fn().mockResolvedValue(true),
        populate: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(Property, 'findById').mockResolvedValueOnce(mockPropertyDoc as any);

      const response = await request(app)
        .patch('/api/property')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${managerToken}`])
        .send({
          name: 'Skyline Heights Luxury Residences',
          unitCount: 60,
        });

      expect(response.status).toBe(200);
      expect(mockPropertyDoc.name).toBe('Skyline Heights Luxury Residences');
      expect(mockPropertyDoc.unitCount).toBe(60);
      expect(mockPropertyDoc.save).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/auth/profile', () => {
    it('allows user to update display name and unit number', async () => {
      const mockUserDoc = {
        _id: tenantId,
        name: 'Tom Tenant',
        email: 'tom@tenantpro.com',
        role: 'tenant',
        property: propertyId,
        unitNumber: '4B',
        isActive: true,
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(User, 'findById').mockResolvedValueOnce(mockUserDoc as any);

      const response = await request(app)
        .patch('/api/auth/profile')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tenantToken}`])
        .send({ name: 'Thomas Tenant', unitNumber: '5C' });

      expect(response.status).toBe(200);
      expect(mockUserDoc.name).toBe('Thomas Tenant');
      expect(mockUserDoc.unitNumber).toBe('5C');
      expect(response.body.user.name).toBe('Thomas Tenant');
    });
  });

  describe('PATCH /api/auth/password', () => {
    it('rejects password change if current password is wrong', async () => {
      const mockUserDoc = {
        _id: tenantId,
        passwordHash: await bcrypt.hash('CorrectPass123', 10),
        isActive: true,
      };

      vi.spyOn(User, 'findById').mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce(mockUserDoc),
      } as any);

      const response = await request(app)
        .patch('/api/auth/password')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tenantToken}`])
        .send({
          currentPassword: 'WrongPassword123',
          newPassword: 'BrandNewPass123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Current password is incorrect');
    });

    it('updates password when current password matches', async () => {
      const currentPassword = 'OldPassword123';
      const mockUserDoc = {
        _id: tenantId,
        passwordHash: await bcrypt.hash(currentPassword, 10),
        isActive: true,
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(User, 'findById').mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce(mockUserDoc),
      } as any);

      const response = await request(app)
        .patch('/api/auth/password')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${tenantToken}`])
        .send({
          currentPassword,
          newPassword: 'BrandNewPass123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Password updated successfully');
      expect(mockUserDoc.save).toHaveBeenCalled();
    });
  });
});
