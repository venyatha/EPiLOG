import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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

import * as authService from '../../services/authService';

describe('authService.register', () => {
  it('hashes the password and creates a user', async () => {
    const mockUser = { id: 1, username: 'alice', email: 'alice@test.com' };
    prismaMock.user.create.mockResolvedValue(mockUser as any);

    const result = await authService.register('alice', 'alice@test.com', 'password123');

    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    const callArg = prismaMock.user.create.mock.calls[0][0];
    expect(callArg.data.username).toBe('alice');
    expect(callArg.data.email).toBe('alice@test.com');
    // passwordHash should not be plain text
    expect(callArg.data.passwordHash).not.toBe('password123');
    await expect(bcrypt.compare('password123', callArg.data.passwordHash)).resolves.toBe(true);
  });

  it('returns a token and user on success', async () => {
    const mockUser = { id: 1, username: 'alice', email: 'alice@test.com' };
    prismaMock.user.create.mockResolvedValue(mockUser as any);

    const result = await authService.register('alice', 'alice@test.com', 'password123');

    expect(result.user).toEqual(mockUser);
    expect(typeof result.token).toBe('string');
    const payload = jwt.verify(result.token, 'test-secret') as any;
    expect(payload.id).toBe(1);
    expect(payload.username).toBe('alice');
  });
});

describe('authService.login', () => {
  it('throws Invalid credentials when user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(authService.login('noone@test.com', 'pass')).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('throws Invalid credentials when password is wrong', async () => {
    const hash = await bcrypt.hash('correctpass', 10);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      username: 'alice',
      email: 'alice@test.com',
      passwordHash: hash,
      createdAt: new Date(),
    } as any);

    await expect(authService.login('alice@test.com', 'wrongpass')).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('returns token and user on correct credentials', async () => {
    const hash = await bcrypt.hash('correctpass', 10);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      username: 'alice',
      email: 'alice@test.com',
      passwordHash: hash,
      createdAt: new Date(),
    } as any);

    const result = await authService.login('alice@test.com', 'correctpass');

    expect(result.user).toEqual({ id: 1, username: 'alice', email: 'alice@test.com' });
    expect(typeof result.token).toBe('string');
    const payload = jwt.verify(result.token, 'test-secret') as any;
    expect(payload.id).toBe(1);
  });
});
