import { Router } from 'express';
import { addServiceMedia, createServiceRequest, downloadServiceReport, getServiceRequest, getServiceTracking, listServiceRequests, submitServiceReview, updateServiceRequest } from '../controllers/serviceRequestController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadServiceMedia } from '../middleware/uploadMiddleware.js';

const router = Router();
router.use(protect);
router.route('/').get(listServiceRequests).post(createServiceRequest);
router.post('/:id/media', uploadServiceMedia, addServiceMedia);
router.get('/:id/tracking', getServiceTracking);
router.get('/:id/report', downloadServiceReport);
router.patch('/:id/review', submitServiceReview);
router.route('/:id').get(getServiceRequest).patch(updateServiceRequest);
export default router;
