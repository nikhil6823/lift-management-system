import { Router } from 'express';
import { createEmployee, getEmployee, listEmployees, removeEmployee, updateEmployee } from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();
router.use(protect, allowRoles('admin'));
router.route('/').get(listEmployees).post(createEmployee);
router.route('/:id').get(getEmployee).patch(updateEmployee).delete(removeEmployee);
export default router;

