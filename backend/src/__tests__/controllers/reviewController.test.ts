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

const mockReview = {
  id: 1,
  userId: 1,
  tmdbShowId: 100,
  showName: 'Breaking Bad',
  posterPath: null,
  rating: 9,
  body: 'Great show',
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { username: 'alice' },
};

describe('GET /api/reviews/show/:tmdbId', () => {
  it('returns 400 for invalid tmdbId', async () => {
    const res = await request(app).get('/api/reviews/show/abc');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid/);
  });

  it('returns 200 with reviews array', async () => {
    prismaMock.review.findMany.mockResolvedValue([mockReview] as any);

    const res = await request(app).get('/api/reviews/show/100');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].rating).toBe(9);
  });
});

describe('GET /api/reviews/user/:username', () => {
  it('returns 404 when user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/reviews/user/nobody');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 200 with user reviews', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, username: 'alice' } as any);
    prismaMock.review.findMany.mockResolvedValue([mockReview] as any);

    const res = await request(app).get('/api/reviews/user/alice');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/reviews', () => {
  it('returns 401 with no auth', async () => {
    const res = await request(app).post('/api/reviews').send({ tmdbShowId: 100, showName: 'Test', rating: 8 });
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', authHeader)
      .send({ showName: 'Test', rating: 8 }); // missing tmdbShowId
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/);
  });

  it('returns 400 when rating is out of range', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', authHeader)
      .send({ tmdbShowId: 100, showName: 'Test', rating: 11 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/between 1 and 10/);
  });

  it('returns 409 when review already exists', async () => {
    const prismaError = new PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });
    prismaMock.review.create.mockRejectedValue(prismaError);

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', authHeader)
      .send({ tmdbShowId: 100, showName: 'Breaking Bad', rating: 9 });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already reviewed/i);
  });

  it('returns 201 on successful review creation', async () => {
    prismaMock.review.create.mockResolvedValue(mockReview as any);

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', authHeader)
      .send({ tmdbShowId: 100, showName: 'Breaking Bad', rating: 9 });
    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(9);
  });
});

describe('PUT /api/reviews/:tmdbId', () => {
  it('returns 401 with no auth', async () => {
    const res = await request(app).put('/api/reviews/100').send({ rating: 8 });
    expect(res.status).toBe(401);
  });

  it('returns 404 when review not found', async () => {
    prismaMock.review.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/reviews/100')
      .set('Authorization', authHeader)
      .send({ rating: 8 });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 400 when rating is out of range', async () => {
    const res = await request(app)
      .put('/api/reviews/100')
      .set('Authorization', authHeader)
      .send({ rating: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/between 1 and 10/);
  });

  it('returns 200 with updated review', async () => {
    prismaMock.review.findUnique.mockResolvedValue(mockReview as any);
    const updated = { ...mockReview, rating: 8 };
    prismaMock.review.update.mockResolvedValue(updated as any);

    const res = await request(app)
      .put('/api/reviews/100')
      .set('Authorization', authHeader)
      .send({ rating: 8 });
    expect(res.status).toBe(200);
    expect(res.body.rating).toBe(8);
  });
});

describe('DELETE /api/reviews/:tmdbId', () => {
  it('returns 401 with no auth', async () => {
    const res = await request(app).delete('/api/reviews/100');
    expect(res.status).toBe(401);
  });

  it('returns 404 when review not found', async () => {
    prismaMock.review.deleteMany.mockResolvedValue({ count: 0 });

    const res = await request(app)
      .delete('/api/reviews/100')
      .set('Authorization', authHeader);
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 204 on successful deletion', async () => {
    prismaMock.review.deleteMany.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .delete('/api/reviews/100')
      .set('Authorization', authHeader);
    expect(res.status).toBe(204);
  });
});
