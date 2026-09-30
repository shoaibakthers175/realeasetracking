import { Router } from 'express';
import { getReportsData, exportReportExcel } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getReportsData);
router.get('/export/excel', authenticate, exportReportExcel);

export default router;
