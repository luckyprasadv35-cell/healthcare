import { Router } from 'express';
import { upsertProfile } from '../controllers/profileController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validateRequest';
import { ProfileSchema } from '../schemas/profileSchema';

const router = Router();
router.post('/', authenticate, validateBody(ProfileSchema), upsertProfile);
export default router;
