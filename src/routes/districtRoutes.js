import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getDistricts,
  getDistrictById,
  createDistrict,
  createDistrictValidation,
  updateDistrict,
  updateDistrictValidation,
  deleteDistrict,
} from '../controllers/districtController.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getDistricts)
  .post(authorize('ADMIN'), createDistrictValidation, validate, createDistrict);

router.route('/:id')
  .get(getDistrictById)
  .put(authorize('ADMIN'), updateDistrictValidation, validate, updateDistrict)
  .delete(authorize('ADMIN'), deleteDistrict);

export default router;
