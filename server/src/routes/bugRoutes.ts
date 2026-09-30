import { Router } from 'express';
import { getBugs, createBug, updateBug } from '../controllers/bugController';
import { authenticate } from '../middleware/auth';
import { canModifyReleases } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getBugs);
router.post('/', authenticate, canModifyReleases, createBug);
router.patch('/:id', authenticate, canModifyReleases, updateBug);

export default router;
