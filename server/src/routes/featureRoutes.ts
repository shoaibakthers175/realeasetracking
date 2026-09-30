import { Router } from 'express';
import {
  getFeatures,
  getMatrix,
  getFeatureById,
  createFeature,
  updateFeature,
} from '../controllers/featureController';
import { authenticate } from '../middleware/auth';
import { canModifyReleases } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getFeatures);
router.get('/matrix', authenticate, getMatrix);
router.get('/:id', authenticate, getFeatureById);
router.post('/', authenticate, canModifyReleases, createFeature);
router.patch('/:id', authenticate, canModifyReleases, updateFeature);

export default router;
