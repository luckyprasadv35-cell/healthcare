import { Router } from 'express';
import { logProgress, getProgressHistory } from '../controllers/progressController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validateRequest';
import { ProgressLogSchema } from '../schemas/progressSchema';

const router = Router();
router.post('/log', authenticate, validateBody(ProgressLogSchema), logProgress);
router.get('/history', authenticate, getProgressHistory);
export default router;
