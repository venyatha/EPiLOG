import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '../lib/prisma';

export async function getReviewsForShow(req: Request, res: Response): Promise<void> {
  const tmdbShowId = parseInt(req.params.tmdbId, 10);
  if (isNaN(tmdbShowId)) {
    res.status(400).json({ error: 'Invalid tmdbId' });
    return;
  }

  const reviews = await prisma.review.findMany({
    where: { tmdbShowId },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(reviews);
}

export async function getReviewsByUser(req: Request, res: Response): Promise<void> {
  const { username } = req.params;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  });
  res.json(reviews);
}

export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.id;
  const { tmdbShowId, showName, posterPath, rating, body } = req.body;

  if (!tmdbShowId || !showName || rating == null) {
    res.status(400).json({ error: 'tmdbShowId, showName, and rating are required' });
    return;
  }

  if (rating < 1 || rating > 10) {
    res.status(400).json({ error: 'rating must be between 1 and 10' });
    return;
  }

  try {
    const review = await prisma.review.create({
      data: {
        userId,
        tmdbShowId: Number(tmdbShowId),
        showName,
        posterPath: posterPath || null,
        rating: Number(rating),
        body: body || null,
      },
      include: { user: { select: { username: true } } },
    });
    res.status(201).json(review);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      res.status(409).json({ error: 'You have already reviewed this show' });
      return;
    }
    next(err);
  }
}

export async function updateReview(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const tmdbShowId = parseInt(req.params.tmdbId, 10);

  if (isNaN(tmdbShowId)) {
    res.status(400).json({ error: 'Invalid tmdbId' });
    return;
  }

  const { rating, body } = req.body;

  if (rating != null && (rating < 1 || rating > 10)) {
    res.status(400).json({ error: 'rating must be between 1 and 10' });
    return;
  }

  const existing = await prisma.review.findUnique({
    where: { userId_tmdbShowId: { userId, tmdbShowId } },
  });

  if (!existing) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }

  const review = await prisma.review.update({
    where: { userId_tmdbShowId: { userId, tmdbShowId } },
    data: {
      ...(rating != null && { rating: Number(rating) }),
      ...(body !== undefined && { body }),
    },
    include: { user: { select: { username: true } } },
  });
  res.json(review);
}

export async function deleteReview(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const tmdbShowId = parseInt(req.params.tmdbId, 10);

  if (isNaN(tmdbShowId)) {
    res.status(400).json({ error: 'Invalid tmdbId' });
    return;
  }

  const deleted = await prisma.review.deleteMany({
    where: { userId, tmdbShowId },
  });

  if (deleted.count === 0) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }

  res.status(204).send();
}
