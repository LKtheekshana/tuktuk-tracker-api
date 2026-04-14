import { body, param, query } from 'express-validator';
import Vehicle from '../models/Vehicle.js';
import LocationPing from '../models/LocationPing.js';

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles with optional filtering and pagination
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: province
 *         schema: { type: string }
 *         description: Filter by Province ObjectId
 *       - in: query
 *         name: district
 *         schema: { type: string }
 *         description: Filter by District ObjectId
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive, suspended] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of vehicles
 */
export const getVehiclesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const getVehicles = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.province) filter.province = req.query.province;
    if (req.query.district) filter.district = req.query.district;
    if (req.query.status) filter.status = req.query.status;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter)
        .populate('province', 'name code')
        .populate('district', 'name')
        .sort({ registrationNumber: 1 })
        .skip(skip)
        .limit(limit),
      Vehicle.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      results: vehicles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: { vehicles },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get a single vehicle by ID
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vehicle details
 *       404:
 *         description: Vehicle not found
 */
export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('province', 'name code')
      .populate('district', 'name');
    if (!vehicle) {
      return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
    }
    res.status(200).json({ status: 'success', data: { vehicle } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Register a new tuk-tuk (ADMIN only)
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vehicle'
 *     responses:
 *       201:
 *         description: Vehicle registered successfully
 */
export const createVehicleValidation = [
  body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
  body('driverName').trim().notEmpty().withMessage('Driver name is required'),
  body('driverNIC').trim().notEmpty().withMessage('Driver NIC is required'),
  body('district').isMongoId().withMessage('Valid district ID is required'),
  body('province').isMongoId().withMessage('Valid province ID is required'),
];

export const createVehicle = async (req, res, next) => {
  try {
    const { registrationNumber, driverName, driverNIC, district, province, status } = req.body;
    const vehicle = await Vehicle.create({ registrationNumber, driverName, driverNIC, district, province, status });
    res.status(201).json({ status: 'success', data: { vehicle } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Update vehicle details (ADMIN only)
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 */
export const updateVehicleValidation = [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),
];

export const updateVehicle = async (req, res, next) => {
  try {
    // Prevent overwriting lastLocation via this endpoint
    delete req.body.lastLocation;

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) {
      return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
    }
    res.status(200).json({ status: 'success', data: { vehicle } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Delete a vehicle (ADMIN only)
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 */
export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/vehicles/{id}/location:
 *   get:
 *     summary: Get the last known location of a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Last known location
 *       404:
 *         description: Vehicle not found or no location data
 */
export const getLastLocation = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).select('registrationNumber lastLocation');
    if (!vehicle) {
      return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
    }
    if (!vehicle.lastLocation || !vehicle.lastLocation.latitude) {
      return res.status(404).json({ status: 'error', message: 'No location data available for this vehicle' });
    }
    res.status(200).json({ status: 'success', data: { location: vehicle.lastLocation, registrationNumber: vehicle.registrationNumber } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/vehicles/{id}/history:
 *   get:
 *     summary: Get location history for a vehicle within a time window
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         required: true
 *         schema: { type: string, format: date-time }
 *         description: Start of time window (ISO 8601)
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *         description: End of time window (ISO 8601), defaults to now
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 500 }
 *     responses:
 *       200:
 *         description: Chronological location history
 *       400:
 *         description: Missing or invalid time window
 */
export const getLocationHistory = async (req, res, next) => {
  try {
    const { from, to, limit } = req.query;

    if (!from) {
      return res.status(400).json({ status: 'error', message: "'from' query parameter is required (ISO 8601 datetime)" });
    }

    const fromDate = new Date(from);
    const toDate = to ? new Date(to) : new Date();

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ status: 'error', message: 'Invalid date format. Use ISO 8601 (e.g. 2026-03-25T00:00:00Z)' });
    }

    const vehicle = await Vehicle.findById(req.params.id).select('registrationNumber');
    if (!vehicle) {
      return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
    }

    const maxLimit = Math.min(parseInt(limit, 10) || 500, 1000);

    const pings = await LocationPing.find({
      vehicle: req.params.id,
      timestamp: { $gte: fromDate, $lte: toDate },
    })
      .select('latitude longitude speed heading timestamp')
      .sort({ timestamp: 1 })
      .limit(maxLimit);

    res.status(200).json({
      status: 'success',
      results: pings.length,
      data: {
        vehicle: { id: vehicle._id, registrationNumber: vehicle.registrationNumber },
        from: fromDate,
        to: toDate,
        pings,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/vehicles/{id}/ping:
 *   post:
 *     summary: Submit a location ping for a vehicle (DEVICE role only)
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [latitude, longitude]
 *             properties:
 *               latitude: { type: number, example: 6.9271 }
 *               longitude: { type: number, example: 79.8612 }
 *               speed: { type: number, example: 30 }
 *               heading: { type: number, example: 180 }
 *               timestamp: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Ping recorded successfully
 *       403:
 *         description: Device not authorized for this vehicle
 */
export const postPingValidation = [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('speed').optional().isFloat({ min: 0 }).withMessage('Speed must be non-negative'),
  body('heading').optional().isFloat({ min: 0, max: 360 }).withMessage('Heading must be between 0 and 360'),
];

export const postPing = async (req, res, next) => {
  try {
    const vehicleId = req.params.id;

    // DEVICE users can only ping their own vehicle
    if (req.user.role === 'DEVICE') {
      const authorizedVehicleId = req.user.vehicle?.toString();
      if (!authorizedVehicleId || authorizedVehicleId !== vehicleId) {
        return res.status(403).json({ status: 'error', message: 'This device is not authorized to ping this vehicle.' });
      }
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
    }

    if (vehicle.status === 'suspended') {
      return res.status(403).json({ status: 'error', message: 'Vehicle is suspended and cannot submit pings.' });
    }

    const { latitude, longitude, speed, heading, timestamp } = req.body;
    const pingTime = timestamp ? new Date(timestamp) : new Date();

    const ping = await LocationPing.create({ vehicle: vehicleId, latitude, longitude, speed, heading, timestamp: pingTime });

    // Update vehicle's lastLocation in-place (denormalized for fast lookups)
    await Vehicle.findByIdAndUpdate(vehicleId, {
      lastLocation: { latitude, longitude, timestamp: pingTime },
    });

    res.status(201).json({ status: 'success', data: { ping } });
  } catch (err) {
    next(err);
  }
};
