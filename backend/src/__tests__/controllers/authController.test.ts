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

describe('POST /api/auth/register', () => {
  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'alice' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/);
  });

  it('returns 409 when username or email is taken', async () => {
    const prismaError = new PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });
    prismaMock.user.create.mockRejectedValue(prismaError);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@test.com', password: 'pass123' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already taken/);
  });

  it('returns 500 (not a hang) when the database table does not exist', async () => {
    // Regression test: without next(err), a missing-table error caused an
    // unhandled promise rejection and the request hung indefinitely.
    const prismaError = new PrismaClientKnownRequestError('Table does not exist', {
      code: 'P2021',
      clientVersion: '5.0.0',
    });
    prismaMock.user.create.mockRejectedValue(prismaError);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@test.com', password: 'pass123' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });

  it('returns 201 with token and user on success', async () => {
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      username: 'alice',
      email: 'alice@test.com',
    } as any);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@test.com', password: 'pass123' });
    expect(res.status).toBe(201);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.username).toBe('alice');
  });
});

describe('POST /api/auth/login', () => {
  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'alice@test.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/);
  });

  it('returns 401 on bad credentials', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns 500 (not a hang) when the database table does not exist', async () => {
    // Regression test: without next(err), a missing-table error caused an
    // unhandled promise rejection and the request hung indefinitely.
    const prismaError = new PrismaClientKnownRequestError('Table does not exist', {
      code: 'P2021',
      clientVersion: '5.0.0',
    });
    prismaMock.user.findUnique.mockRejectedValue(prismaError);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'pass123' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });

  it('returns 200 with token on success', async () => {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('pass123', 10);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      username: 'alice',
      email: 'alice@test.com',
      passwordHash: hash,
      createdAt: new Date(),
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'pass123' });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 200 with user payload for valid token', async () => {
    const token = jwt.sign({ id: 1, username: 'alice', email: 'alice@test.com' }, 'test-secret');
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('alice');
  });
});
