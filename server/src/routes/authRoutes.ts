import { Router } from 'express';
import { syncAuth } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
router.post('/sync', authenticate, syncAuth);
export default router;
