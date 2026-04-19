import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getUsers,
  getUserById,
  updateUser,
  updateUserValidation,
  deleteUser,
} from '../controllers/userController.js';

const router = Router();

router.use(protect, authorize('ADMIN'));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUserById)
  .put(updateUserValidation, validate, updateUser)
  .delete(deleteUser);

export default router;
