import { Router } from 'express';
import { addLiftImage, createLift, deleteLift, getLift, listLifts, updateCustomerLiftStatus, updateLift } from '../controllers/liftController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { uploadLiftImage } from '../middleware/uploadMiddleware.js';

const router = Router();
router.use(protect);
router.route('/').get(listLifts).post(allowRoles('admin'), createLift);
router.post('/:id/images', allowRoles('admin', 'employee', 'customer'), uploadLiftImage, addLiftImage);
router.patch('/:id/customer-status', allowRoles('customer'), updateCustomerLiftStatus);
router.route('/:id').get(getLift).patch(allowRoles('admin'), updateLift).delete(allowRoles('admin'), deleteLift);
export default router;
