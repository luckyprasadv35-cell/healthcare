import { Router } from 'express';
import { syncAuth, registerUser } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
router.post('/sync', authenticate, syncAuth);
router.post('/register', registerUser); // Public route for admin registration bypass
export default router;
