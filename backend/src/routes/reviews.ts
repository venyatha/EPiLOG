import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/show/:tmdbId', reviewController.getReviewsForShow);
router.get('/user/:username', reviewController.getReviewsByUser);
router.post('/', requireAuth, reviewController.createReview);
router.put('/:tmdbId', requireAuth, reviewController.updateReview);
router.delete('/:tmdbId', requireAuth, reviewController.deleteReview);

export default router;
