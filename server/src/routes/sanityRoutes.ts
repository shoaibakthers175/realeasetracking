import { Router } from 'express';
import {
  getSanityReports,
  getSanityReportById,
  createSanityReport,
  updateSanityReport,
} from '../controllers/sanityController';
import { authenticate } from '../middleware/auth';
import { canModifyReleases } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getSanityReports);
router.get('/:id', authenticate, getSanityReportById);
router.post('/', authenticate, canModifyReleases, createSanityReport);
router.patch('/:id', authenticate, canModifyReleases, updateSanityReport);

export default router;
