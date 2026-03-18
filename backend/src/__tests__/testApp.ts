import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from '../routes/auth';
import showRoutes from '../routes/shows';
import followRoutes from '../routes/follows';
import reviewRoutes from '../routes/reviews';
import userRoutes from '../routes/users';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
