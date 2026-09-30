import { Router } from 'express';
import { uploadAttachment } from '../controllers/attachmentController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/upload', authenticate, upload.single('file'), uploadAttachment);

export default router;
