import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
} from '../controllers/leadController';
import { authenticate } from '../middleware/auth';
import { canModifyReleases } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getLeads);
router.get('/:id', authenticate, getLeadById);
router.post('/', authenticate, canModifyReleases, createLead);
router.patch('/:id', authenticate, canModifyReleases, updateLead);

export default router;
