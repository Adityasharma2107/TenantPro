import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../app.js';
import { AUTH_COOKIE_NAME } from '../config/auth.js';
import { Property } from '../models/Property.model.js';
import { User } from '../models/User.model.js';
import { createAccessToken } from '../utils/auth-token.js';

describe('Auth Endpoints Integration Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('rejects registration when request body fails validation', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'J', // too short
          email: 'not-an-email',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('rejects registration with 409 if email already exists', async () => {
      vi.spyOn(User, 'exists').mockResolvedValueOnce({ _id: new Types.ObjectId() } as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
          property: {
            name: 'Sunset Heights',
            address: {
              line1: '123 Main St',
              city: 'Austin',
              state: 'TX',
              postalCode: '78701',
            },
            unitCount: 24,
          },
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already uses this email');
    });

    it('successfully registers manager, creates property, and sets auth cookie', async () => {
      const mockPropertyId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();

      vi.spyOn(User, 'exists').mockResolvedValueOnce(null);
      vi.spyOn(Property, 'create').mockResolvedValueOnce({
        _id: mockPropertyId,
        name: 'Sunset Heights',
        address: {
          line1: '123 Main St',
          city: 'Austin',
          state: 'TX',
          postalCode: '78701',
        },
        unitCount: 24,
        contactEmail: 'jane@example.com',
        manager: undefined,
        save: vi.fn().mockResolvedValue(true),
      } as any);

      vi.spyOn(User, 'create').mockResolvedValueOnce({
        _id: mockUserId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'manager',
        property: mockPropertyId,
        isActive: true,
      } as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
          property: {
            name: 'Sunset Heights',
            address: {
              line1: '123 Main St',
              city: 'Austin',
              state: 'TX',
              postalCode: '78701',
            },
            unitCount: 24,
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toMatchObject({
        id: mockUserId.toString(),
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'manager',
      });
      expect(response.body.property).toMatchObject({
        id: mockPropertyId.toString(),
        name: 'Sunset Heights',
      });

      const setCookieHeader = response.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader[0]).toContain(AUTH_COOKIE_NAME);
    });
  });

  describe('POST /api/auth/login', () => {
    it('rejects login with invalid email or missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'bad-email', password: '' });

      expect(response.status).toBe(400);
    });

    it('returns 401 when account is not found or password does not match', async () => {
      vi.spyOn(User, 'findOne').mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce(null),
      } as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unknown@example.com', password: 'Password123!' });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('incorrect');
    });

    it('successfully authenticates with valid credentials and sets HTTP-only cookie', async () => {
      const mockUserId = new Types.ObjectId();
      const mockPropertyId = new Types.ObjectId();
      const mockUser = {
        _id: mockUserId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'manager',
        property: mockPropertyId,
        passwordHash: 'hashed_pw',
        isActive: true,
      };

      vi.spyOn(User, 'findOne').mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce(mockUser),
      } as any);

      vi.spyOn(bcrypt, 'compare').mockImplementationOnce(async () => true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@example.com', password: 'Password123!' });

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        id: mockUserId.toString(),
        name: 'Jane Doe',
        role: 'manager',
      });

      const setCookieHeader = response.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader[0]).toContain(AUTH_COOKIE_NAME);
      expect(setCookieHeader[0]).toContain('HttpOnly');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 when unauthenticated', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('log in to continue');
    });

    it('returns authenticated user profile when valid auth cookie is sent', async () => {
      const mockUserId = new Types.ObjectId();
      const mockPropertyId = new Types.ObjectId();

      const token = createAccessToken({
        _id: mockUserId,
        role: 'manager',
        property: mockPropertyId,
      });

      vi.spyOn(User, 'findById').mockResolvedValueOnce({
        _id: mockUserId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'manager',
        property: mockPropertyId,
        isActive: true,
      } as any);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        id: mockUserId.toString(),
        name: 'Jane Doe',
        role: 'manager',
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('clears auth cookie on logout', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Logged out');
      const setCookieHeader = response.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader[0]).toContain(`${AUTH_COOKIE_NAME}=;`);
    });
  });
});
