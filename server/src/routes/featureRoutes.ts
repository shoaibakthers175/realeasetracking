import { Router } from 'express';
import {
  getFeatures,
  getMatrix,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature,
} from '../controllers/featureController';
import { authenticate } from '../middleware/auth';
import { canModifyReleases, canAdministerSystem } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getFeatures);
router.get('/matrix', authenticate, getMatrix);
router.get('/:id', authenticate, getFeatureById);
router.post('/', authenticate, canModifyReleases, createFeature);
router.patch('/:id', authenticate, canModifyReleases, updateFeature);
router.delete('/:id', authenticate, canAdministerSystem, deleteFeature);

export default router;
