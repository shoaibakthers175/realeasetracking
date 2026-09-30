import { Router } from 'express';
import { getCalendarEvents, getDayActivities } from '../controllers/calendarController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getCalendarEvents);
router.get('/day/:date', authenticate, getDayActivities);

export default router;
