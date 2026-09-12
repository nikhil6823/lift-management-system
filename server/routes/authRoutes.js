import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, me, register, registerCustomer, resendEmailVerification, updateProfile, verifyEmail, verifyLoginCode } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: { message: 'Too many authentication attempts. Try again later.' } });
router.post('/register', authLimiter, register);
router.post('/customer-register', authLimiter, registerCustomer);
router.post('/login', authLimiter, login);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-email-verification', authLimiter, resendEmailVerification);
router.post('/verify-login-code', authLimiter, verifyLoginCode);
router.get('/me', protect, me);
router.patch('/profile', protect, updateProfile);
export default router;
