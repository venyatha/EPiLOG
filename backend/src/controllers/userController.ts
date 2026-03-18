import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getProfile(req: Request, res: Response): Promise<void> {
  const { username } = req.params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      createdAt: true,
      _count: { select: { followedShows: true, reviews: true } },
    },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
}

export async function getUserFollows(req: Request, res: Response): Promise<void> {
  const { username } = req.params;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const follows = await prisma.followedShow.findMany({
    where: { userId: user.id },
    orderBy: { followedAt: 'desc' },
  });
  res.json(follows);
}
