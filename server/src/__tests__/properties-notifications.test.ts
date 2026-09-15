import { Types } from 'mongoose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../app.js';
import { AUTH_COOKIE_NAME } from '../config/auth.js';
import { Notification } from '../models/Notification.model.js';
import { Property } from '../models/Property.model.js';
import { Ticket } from '../models/Ticket.model.js';
import { User } from '../models/User.model.js';
import { createAccessToken } from '../utils/auth-token.js';

describe('Multi-Property & Notification Center Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const managerId = new Types.ObjectId();
  const propertyId = new Types.ObjectId();

  const managerToken = createAccessToken({
    _id: managerId,
    role: 'manager',
    property: propertyId,
  });

  describe('Property Management Operations', () => {
    it('creates a new property under manager control', async () => {
      const newPropId = new Types.ObjectId();
      const mockCreated = {
        _id: newPropId,
        name: 'Sunset Villa',
        address: {
          line1: '456 Palm Ave',
          city: 'Miami',
          state: 'FL',
          postalCode: '33101',
        },
        unitCount: 32,
        contactEmail: 'sunset@tenantpro.com',
        manager: managerId,
      };

      vi.spyOn(Property, 'create').mockResolvedValueOnce(mockCreated as any);

      const response = await request(app)
        .post('/api/property')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${managerToken}`])
        .send({
          name: 'Sunset Villa',
          address: {
            line1: '456 Palm Ave',
            city: 'Miami',
            state: 'FL',
            postalCode: '33101',
          },
          unitCount: 32,
          contactEmail: 'sunset@tenantpro.com',
        });

      expect(response.status).toBe(201);
      expect(response.body.property.name).toBe('Sunset Villa');
      expect(response.body.property.unitCount).toBe(32);
    });

    it('lists all properties for the manager', async () => {
      const mockProps = [
        {
          _id: propertyId,
          name: 'Skyline Heights',
          address: { line1: '100 Panorama Way', city: 'Austin', state: 'TX', postalCode: '78701' },
          unitCount: 48,
        },
      ];

      vi.spyOn(Property, 'find').mockReturnValueOnce({
        sort: vi.fn().mockResolvedValueOnce(mockProps),
      } as any);

      vi.spyOn(User, 'countDocuments').mockResolvedValue(2);
      vi.spyOn(Ticket, 'countDocuments').mockResolvedValue(1);

      const response = await request(app)
        .get('/api/property/all')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${managerToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.properties).toHaveLength(1);
      expect(response.body.properties[0].isActive).toBe(true);
    });

    it('switches manager active property and re-issues cookie', async () => {
      const targetPropId = new Types.ObjectId();
      const mockTargetProp = {
        _id: targetPropId,
        name: 'Hilltop Manor',
        address: { line1: '789 Crest Rd', city: 'Austin', state: 'TX', postalCode: '78704' },
        unitCount: 20,
        manager: managerId,
      };

      vi.spyOn(Property, 'findOne').mockResolvedValueOnce(mockTargetProp as any);
      vi.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce({} as any);

      const response = await request(app)
        .post('/api/property/switch')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${managerToken}`])
        .send({ propertyId: targetPropId.toString() });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Switched active property to Hilltop Manor');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('Notification Operations', () => {
    it('returns notifications and unread count for current user', async () => {
      const mockNotification = {
        _id: new Types.ObjectId(),
        recipient: managerId,
        type: 'ticket_created',
        title: 'New Maintenance Ticket',
        message: 'Leak in Unit 4B',
        read: false,
        createdAt: new Date(),
      };

      vi.spyOn(Notification, 'find').mockReturnValueOnce({
        sort: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockReturnValueOnce({
            populate: vi.fn().mockReturnValueOnce({
              populate: vi.fn().mockResolvedValueOnce([mockNotification]),
            }),
          }),
        }),
      } as any);

      vi.spyOn(Notification, 'countDocuments').mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/notifications')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${managerToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.unreadCount).toBe(1);
      expect(response.body.notifications).toHaveLength(1);
      expect(response.body.notifications[0].title).toBe('New Maintenance Ticket');
    });

    it('marks all notifications as read', async () => {
      vi.spyOn(Notification, 'updateMany').mockResolvedValueOnce({} as any);

      const response = await request(app)
        .post('/api/notifications/mark-all-read')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${managerToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.unreadCount).toBe(0);
      expect(Notification.updateMany).toHaveBeenCalledWith(
        { recipient: managerId.toString(), read: false },
        { read: true },
      );
    });
  });
});
