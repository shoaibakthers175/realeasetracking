import { Router } from 'express';
import authRoutes from './authRoutes';
import universityRoutes from './universityRoutes';
import featureRoutes from './featureRoutes';
import releaseRoutes from './releaseRoutes';
import bugRoutes from './bugRoutes';
import sanityRoutes from './sanityRoutes';
import leadRoutes from './leadRoutes';
import calendarRoutes from './calendarRoutes';
import dashboardRoutes from './dashboardRoutes';
import reportRoutes from './reportRoutes';
import auditRoutes from './auditRoutes';
import searchRoutes from './searchRoutes';
import userRoutes from './userRoutes';
import attachmentRoutes from './attachmentRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/universities', universityRoutes);
router.use('/features', featureRoutes);
router.use('/releases', releaseRoutes);
router.use('/bugs', bugRoutes);
router.use('/sanity-reports', sanityRoutes);
router.use('/sanity', sanityRoutes);
router.use('/leads', leadRoutes);
router.use('/calendar', calendarRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/search', searchRoutes);
router.use('/users', userRoutes);
router.use('/attachments', attachmentRoutes);

export default router;
