import { Router } from 'express';
import {
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  checkPasswordResetStatus,
  getPasswordResetRequests,
  approvePasswordResetRequest,
  rejectPasswordResetRequest,
  resetPassword,
  changePassword,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { canAdministerSystem } from '../middleware/rbac';

const router = Router();

router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

// Password Reset Workflow
router.post('/forgot-password', forgotPassword);
router.get('/password-reset-status', checkPasswordResetStatus);
router.post('/reset-password', resetPassword);
router.post('/change-password', authenticate, changePassword);

// Admin Approval Endpoints
router.get('/password-reset-requests', authenticate, canAdministerSystem, getPasswordResetRequests);
router.post('/password-reset-requests/:id/approve', authenticate, canAdministerSystem, approvePasswordResetRequest);
router.post('/password-reset-requests/:id/reject', authenticate, canAdministerSystem, rejectPasswordResetRequest);

export default router;
