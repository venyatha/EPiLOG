import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../testApp';

// Prisma mock not needed for middleware tests, but import for consistency
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {},
}));

describe('requireAuth middleware', () => {
  const secret = 'test-secret';

  it('returns 401 when no Authorization header', async () => {
    const res = await request(app).get('/api/follows');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('returns 401 when Authorization header is not Bearer', async () => {
    const res = await request(app)
      .get('/api/follows')
      .set('Authorization', 'Basic sometoken');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('returns 401 for an invalid token', async () => {
    const res = await request(app)
      .get('/api/follows')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });

  it('returns 401 for an expired token', async () => {
    const token = jwt.sign({ id: 1, username: 'u', email: 'u@test.com' }, secret, {
      expiresIn: -1,
    });
    const res = await request(app)
      .get('/api/follows')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });
});
