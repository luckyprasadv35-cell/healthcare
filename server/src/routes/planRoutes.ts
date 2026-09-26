import { Router } from 'express';
import { generatePlan, getCurrentPlan } from '../controllers/planController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
router.post('/generate', authenticate, generatePlan);
router.get('/current', authenticate, getCurrentPlan);
export default router;
