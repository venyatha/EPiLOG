import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as authService from '../services/authService';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: 'username, email, and password are required' });
    return;
  }

  try {
    const result = await authService.register(username, email, password);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      res.status(409).json({ error: 'Username or email already taken' });
      return;
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  try {
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid credentials') {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    next(err);
  }
}

export function me(req: Request, res: Response): void {
  res.json({ user: req.user });
}
