import { Router } from 'express';
import * as showController from '../controllers/showController';

const router = Router();

router.get('/search', showController.search);
router.get('/:id', showController.detail);

export default router;
