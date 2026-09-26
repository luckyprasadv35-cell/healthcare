import { Router } from 'express';
import authRoutes from './authRoutes';
import profileRoutes from './profileRoutes';
import planRoutes from './planRoutes';
import progressRoutes from './progressRoutes';

const router = Router();
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/plan', planRoutes);
router.use('/progress', progressRoutes);
export default router;
