import { Router } from 'express';
import { createMessage, listContacts, listMessages } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.get('/contacts', listContacts);
router.route('/').get(listMessages).post(createMessage);
export default router;
