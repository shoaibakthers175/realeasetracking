import { Router } from 'express';
import { getAuditLogs, getNotifications, markNotificationsRead } from '../controllers/auditController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/logs', authenticate, getAuditLogs);
router.get('/notifications', authenticate, getNotifications);
router.post('/notifications/read', authenticate, markNotificationsRead);

export default router;
