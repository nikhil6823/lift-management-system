import { Router } from 'express';
import { latestLocations, logLocation, removeLocation } from '../controllers/locationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { uploadLocationPhoto } from '../middleware/uploadMiddleware.js';

const router = Router();
router.use(protect);
router.post('/', uploadLocationPhoto, logLocation);
router.get('/latest', allowRoles('admin'), latestLocations);
router.delete('/:id', allowRoles('admin'), removeLocation);
export default router;
