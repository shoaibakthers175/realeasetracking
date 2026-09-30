import { Router } from 'express';
import {
  getDashboardData,
  cleanDemoDataController,
  resetDemoDataController,
} from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';
import { canAdministerSystem } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, getDashboardData);
router.post('/clean-demo-data', authenticate, cleanDemoDataController);
router.post('/reset-demo-data', authenticate, resetDemoDataController);

export default router;
