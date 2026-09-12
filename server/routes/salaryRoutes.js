import { Router } from 'express';
import { createSalarySlip, listSalarySlips, updateSalarySlip } from '../controllers/salaryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();
router.use(protect);
router.route('/').get(listSalarySlips).post(allowRoles('admin'), createSalarySlip);
router.patch('/:id', allowRoles('admin'), updateSalarySlip);
export default router;

