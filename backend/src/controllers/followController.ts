import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '../lib/prisma';

export async function getFollows(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const follows = await prisma.followedShow.findMany({
    where: { userId },
    orderBy: { followedAt: 'desc' },
  });
  res.json(follows);
}

export async function followShow(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.id;
  const { tmdbShowId, showName, posterPath } = req.body;

  if (!tmdbShowId || !showName) {
    res.status(400).json({ error: 'tmdbShowId and showName are required' });
    return;
  }

  try {
    const follow = await prisma.followedShow.create({
      data: { userId, tmdbShowId: Number(tmdbShowId), showName, posterPath: posterPath || null },
    });
    res.status(201).json(follow);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      res.status(409).json({ error: 'Already following this show' });
      return;
    }
    next(err);
  }
}

export async function unfollowShow(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const tmdbShowId = parseInt(req.params.tmdbId, 10);

  if (isNaN(tmdbShowId)) {
    res.status(400).json({ error: 'Invalid tmdbId' });
    return;
  }

  const deleted = await prisma.followedShow.deleteMany({
    where: { userId, tmdbShowId },
  });

  if (deleted.count === 0) {
    res.status(404).json({ error: 'Follow not found' });
    return;
  }

  res.status(204).send();
}
