import { Router } from 'express';
import { chatWithCoach } from '../controllers/chatController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
router.post('/', authenticate, chatWithCoach);
export default router;
