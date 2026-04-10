import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getProvinces,
  getProvinceById,
  createProvince,
  createProvinceValidation,
  updateProvince,
  updateProvinceValidation,
  deleteProvince,
} from '../controllers/provinceController.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getProvinces)
  .post(authorize('ADMIN'), createProvinceValidation, validate, createProvince);

router.route('/:id')
  .get(getProvinceById)
  .put(authorize('ADMIN'), updateProvinceValidation, validate, updateProvince)
  .delete(authorize('ADMIN'), deleteProvince);

export default router;
