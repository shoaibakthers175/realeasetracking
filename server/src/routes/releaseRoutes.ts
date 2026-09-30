import { Router } from 'express';
import {
  getReleases,
  getReleaseById,
  createRelease,
  updateRelease,
  deleteRelease,
} from '../controllers/releaseController';
import { authenticate } from '../middleware/auth';
import { canModifyReleases, canAdministerSystem } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getReleases);
router.get('/:id', authenticate, getReleaseById);
router.post('/', authenticate, canModifyReleases, createRelease);
router.patch('/:id', authenticate, canModifyReleases, updateRelease);
router.delete('/:id', authenticate, canAdministerSystem, deleteRelease);

export default router;
