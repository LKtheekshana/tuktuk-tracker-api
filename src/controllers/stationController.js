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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Station ObjectId
 *     responses:
 *       200:
 *         description: Station details
 *       404:
 *         description: Station not found
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Station ObjectId
 *     responses:
 *       200:
 *         description: List of vehicles in the station's district
 *       404:
 *         description: Station not found
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, district, province]
 *             properties:
 *               name: { type: string, example: Colombo Fort Police Station }
 *               code: { type: string, example: CMB-FORT }
 *               district: { type: string, example: 6630a1b2c3d4e5f678901234 }
 *               province: { type: string, example: 6630a1b2c3d4e5f678901234 }
 *               address: { type: string, example: 'No.1, Chaittya Road, Colombo 01' }
 *               contactNumber: { type: string, example: '0112323456' }
 *     responses:
 *       201:
 *         description: Station created
 *       409:
 *         description: Station code already exists
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
    res.setHeader('Location', `/api/stations/${station._id}`);
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Station ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: Colombo Fort Police Station }
 *               code: { type: string, example: CMB-FORT }
 *               address: { type: string, example: 'No.1, Chaittya Road, Colombo 01' }
 *               contactNumber: { type: string, example: '0112323456' }
 *     responses:
 *       200:
 *         description: Station updated
 *       404:
 *         description: Station not found
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Station ObjectId
 *     responses:
 *       204:
 *         description: Station deleted
 *       404:
 *         description: Station not found
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
