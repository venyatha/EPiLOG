import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

import prisma from '../../lib/prisma';
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

import app from '../testApp';

const validToken = jwt.sign({ id: 1, username: 'alice', email: 'alice@test.com' }, 'test-secret');
const authHeader = `Bearer ${validToken}`;

describe('GET /api/follows', () => {
  it('returns 401 with no auth', async () => {
    const res = await request(app).get('/api/follows');
    expect(res.status).toBe(401);
  });

  it('returns 200 with array of follows', async () => {
    const mockFollows = [
      { id: 1, userId: 1, tmdbShowId: 100, showName: 'Breaking Bad', posterPath: null, followedAt: new Date() },
    ];
    prismaMock.followedShow.findMany.mockResolvedValue(mockFollows as any);

    const res = await request(app).get('/api/follows').set('Authorization', authHeader);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].showName).toBe('Breaking Bad');
  });
});

describe('POST /api/follows', () => {
  it('returns 401 with no auth', async () => {
    const res = await request(app).post('/api/follows').send({ tmdbShowId: 100, showName: 'Test' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/follows')
      .set('Authorization', authHeader)
      .send({ showName: 'Test' }); // missing tmdbShowId
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/);
  });

  it('returns 409 when already following', async () => {
    const prismaError = new PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });
    prismaMock.followedShow.create.mockRejectedValue(prismaError);

    const res = await request(app)
      .post('/api/follows')
      .set('Authorization', authHeader)
      .send({ tmdbShowId: 100, showName: 'Breaking Bad' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/Already following/);
  });

  it('returns 201 on successful follow', async () => {
    const mockFollow = { id: 1, userId: 1, tmdbShowId: 100, showName: 'Breaking Bad', posterPath: null, followedAt: new Date() };
    prismaMock.followedShow.create.mockResolvedValue(mockFollow as any);

    const res = await request(app)
      .post('/api/follows')
      .set('Authorization', authHeader)
      .send({ tmdbShowId: 100, showName: 'Breaking Bad' });
    expect(res.status).toBe(201);
    expect(res.body.showName).toBe('Breaking Bad');
  });
});

describe('DELETE /api/follows/:tmdbId', () => {
  it('returns 401 with no auth', async () => {
    const res = await request(app).delete('/api/follows/100');
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid tmdbId', async () => {
    const res = await request(app)
      .delete('/api/follows/abc')
      .set('Authorization', authHeader);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid/);
  });

  it('returns 404 when follow not found', async () => {
    prismaMock.followedShow.deleteMany.mockResolvedValue({ count: 0 });

    const res = await request(app)
      .delete('/api/follows/999')
      .set('Authorization', authHeader);
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 204 on successful unfollow', async () => {
    prismaMock.followedShow.deleteMany.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .delete('/api/follows/100')
      .set('Authorization', authHeader);
    expect(res.status).toBe(204);
  });
});
