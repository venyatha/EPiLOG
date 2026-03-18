import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

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

describe('GET /api/users/:username', () => {
  it('returns 404 when user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/users/nobody');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 200 with user profile including _count', async () => {
    const mockUser = {
      id: 1,
      username: 'alice',
      createdAt: new Date(),
      _count: { followedShows: 5, reviews: 3 },
    };
    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

    const res = await request(app).get('/api/users/alice');
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('alice');
    expect(res.body._count.followedShows).toBe(5);
    expect(res.body._count.reviews).toBe(3);
  });
});

describe('GET /api/users/:username/follows', () => {
  it('returns 404 when user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/users/nobody/follows');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 200 with array of followed shows', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, username: 'alice' } as any);
    const mockFollows = [
      { id: 1, userId: 1, tmdbShowId: 100, showName: 'Breaking Bad', posterPath: null, followedAt: new Date() },
    ];
    prismaMock.followedShow.findMany.mockResolvedValue(mockFollows as any);

    const res = await request(app).get('/api/users/alice/follows');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].showName).toBe('Breaking Bad');
  });
});
