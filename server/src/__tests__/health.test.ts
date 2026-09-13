import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../app.js';

describe('GET /api/health', () => {
  it('returns 200 OK with status ok and healthy message', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'TenantPro API is running.',
      status: 'ok',
    });
  });

  it('returns 404 for nonexistent route', async () => {
    const response = await request(app).get('/api/nonexistent-path-1234');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });
});
