import { Router } from 'express';
import { clockIn, clockOut, listAttendance } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.get('/', listAttendance);
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
export default router;

