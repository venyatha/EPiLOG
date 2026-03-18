import { Router } from 'express';
import * as followController from '../controllers/followController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, followController.getFollows);
router.post('/', requireAuth, followController.followShow);
router.delete('/:tmdbId', requireAuth, followController.unfollowShow);

export default router;
