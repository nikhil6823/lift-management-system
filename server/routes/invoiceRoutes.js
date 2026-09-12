import { Router } from 'express';
import { createInvoice, downloadInvoiceReceipt, listInvoices, recordOnlinePayment } from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();
router.use(protect);
router.route('/').get(listInvoices).post(allowRoles('admin'), createInvoice);
router.post('/:id/payments', allowRoles('customer'), recordOnlinePayment);
router.get('/:id/receipt', allowRoles('customer'), downloadInvoiceReceipt);
export default router;
