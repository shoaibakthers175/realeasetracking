import { Router } from 'express';
import { getUsers, createUser, updateUser } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { canAdministerSystem } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, canAdministerSystem, getUsers);
router.post('/', authenticate, canAdministerSystem, createUser);
router.patch('/:id', authenticate, canAdministerSystem, updateUser);

export default router;
