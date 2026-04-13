import { body, param } from 'express-validator';
import PoliceStation from '../models/PoliceStation.js';
import Vehicle from '../models/Vehicle.js';

/**
 * @swagger
 * /api/stations:
 *   get:
 *     summary: Get all police stations, optionally filtered by district or province
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: district
 *         schema: { type: string }
 *       - in: query
 *         name: province
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of police stations
 */
export const getStations = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.district) filter.district = req.query.district;
    if (req.query.province) filter.province = req.query.province;

    const stations = await PoliceStation.find(filter)
      .populate('district', 'name')
      .populate('province', 'name code')
      .sort({ name: 1 });

    res.status(200).json({ status: 'success', results: stations.length, data: { stations } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/stations/{id}:
 *   get:
 *     summary: Get a single station by ID
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 */
export const getStationById = async (req, res, next) => {
  try {
    const station = await PoliceStation.findById(req.params.id)
      .populate('district', 'name')
      .populate('province', 'name code');
    if (!station) {
      return res.status(404).json({ status: 'error', message: 'Station not found' });
    }
    res.status(200).json({ status: 'success', data: { station } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/stations/{id}/vehicles:
 *   get:
 *     summary: Get all vehicles registered to a station's district
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 */
export const getStationVehicles = async (req, res, next) => {
  try {
    const station = await PoliceStation.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ status: 'error', message: 'Station not found' });
    }

    const vehicles = await Vehicle.find({ district: station.district }).sort({ registrationNumber: 1 });
    res.status(200).json({ status: 'success', results: vehicles.length, data: { vehicles } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/stations:
 *   post:
 *     summary: Create a new police station (ADMIN only)
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 */
export const createStationValidation = [
  body('name').trim().notEmpty().withMessage('Station name is required'),
  body('code').trim().notEmpty().withMessage('Station code is required'),
  body('district').isMongoId().withMessage('Valid district ID is required'),
  body('province').isMongoId().withMessage('Valid province ID is required'),
];

export const createStation = async (req, res, next) => {
  try {
    const { name, code, district, province, address, contactNumber } = req.body;
    const station = await PoliceStation.create({ name, code, district, province, address, contactNumber });
    res.status(201).json({ status: 'success', data: { station } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/stations/{id}:
 *   put:
 *     summary: Update a station (ADMIN only)
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 */
export const updateStationValidation = [
  param('id').isMongoId().withMessage('Invalid station ID'),
];

export const updateStation = async (req, res, next) => {
  try {
    const station = await PoliceStation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!station) {
      return res.status(404).json({ status: 'error', message: 'Station not found' });
    }
    res.status(200).json({ status: 'success', data: { station } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/stations/{id}:
 *   delete:
 *     summary: Delete a station (ADMIN only)
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 */
export const deleteStation = async (req, res, next) => {
  try {
    const station = await PoliceStation.findByIdAndDelete(req.params.id);
    if (!station) {
      return res.status(404).json({ status: 'error', message: 'Station not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
