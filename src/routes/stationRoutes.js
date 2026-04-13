import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getStations,
  getStationById,
  getStationVehicles,
  createStation,
  createStationValidation,
  updateStation,
  updateStationValidation,
  deleteStation,
} from '../controllers/stationController.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getStations)
  .post(authorize('ADMIN'), createStationValidation, validate, createStation);

router.get('/:id/vehicles', getStationVehicles);

router.route('/:id')
  .get(getStationById)
  .put(authorize('ADMIN'), updateStationValidation, validate, updateStation)
  .delete(authorize('ADMIN'), deleteStation);

export default router;
