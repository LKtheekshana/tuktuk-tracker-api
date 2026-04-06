import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  register,
  registerValidation,
  login,
  loginValidation,
  getMe,
} from '../controllers/authController.js';

const router = Router();

router.post('/login', loginValidation, validate, login);
router.post('/register', protect, authorize('ADMIN'), registerValidation, validate, register);
router.get('/me', protect, getMe);

export default router;
