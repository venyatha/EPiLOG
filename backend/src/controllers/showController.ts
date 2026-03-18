import { Request, Response } from 'express';
import { searchShows, getShow } from '../lib/tmdb';

export async function search(req: Request, res: Response): Promise<void> {
  const q = req.query.q as string;
  if (!q || q.trim().length === 0) {
    res.status(400).json({ error: 'Query parameter q is required' });
    return;
  }

  const results = await searchShows(q.trim());
  res.json({ results });
}

export async function detail(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid show id' });
    return;
  }

  const show = await getShow(id);
  res.json(show);
}
