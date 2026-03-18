import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

router.get('/:username', userController.getProfile);
router.get('/:username/follows', userController.getUserFollows);

export default router;
