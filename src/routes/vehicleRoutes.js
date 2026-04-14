import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getVehicles,
  getVehiclesValidation,
  getVehicleById,
  createVehicle,
  createVehicleValidation,
  updateVehicle,
  updateVehicleValidation,
  deleteVehicle,
  getLastLocation,
  getLocationHistory,
  postPing,
  postPingValidation,
} from '../controllers/vehicleController.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getVehiclesValidation, validate, getVehicles)
  .post(authorize('ADMIN'), createVehicleValidation, validate, createVehicle);

// Location endpoints
router.get('/:id/location', getLastLocation);
router.get('/:id/history', getLocationHistory);
router.post('/:id/ping', authorize('ADMIN', 'DEVICE'), postPingValidation, validate, postPing);

router.route('/:id')
  .get(getVehicleById)
  .put(authorize('ADMIN'), updateVehicleValidation, validate, updateVehicle)
  .delete(authorize('ADMIN'), deleteVehicle);

export default router;
