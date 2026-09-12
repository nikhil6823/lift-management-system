import { Router } from 'express';
import { createExpense, listExpenses, updateExpense } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadReceipt } from '../middleware/uploadMiddleware.js';

const router = Router();
router.use(protect);
router.route('/').get(listExpenses).post(uploadReceipt, createExpense);
router.patch('/:id', updateExpense);
export default router;

