import { Router } from 'express';
import {
  getUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} from '../controllers/universityController';
import { authenticate } from '../middleware/auth';
import { canModifyReleases, canAdministerSystem } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getUniversities);
router.get('/:id', authenticate, getUniversityById);
router.post('/', authenticate, canModifyReleases, createUniversity);
router.patch('/:id', authenticate, canModifyReleases, updateUniversity);
router.delete('/:id', authenticate, canAdministerSystem, deleteUniversity);

export default router;
