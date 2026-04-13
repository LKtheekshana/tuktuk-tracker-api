import { body, param } from 'express-validator';
import District from '../models/District.js';

/**
 * @swagger
 * /api/districts:
 *   get:
 *     summary: Get all districts, optionally filtered by province
 *     tags: [Districts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: province
 *         schema: { type: string }
 *         description: Filter by Province ObjectId
 *     responses:
 *       200:
 *         description: List of districts
 */
export const getDistricts = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.province) filter.province = req.query.province;

    const districts = await District.find(filter).populate('province', 'name code').sort({ name: 1 });
    res.status(200).json({ status: 'success', results: districts.length, data: { districts } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/districts/{id}:
 *   get:
 *     summary: Get a single district by ID
 *     tags: [Districts]
 *     security:
 *       - bearerAuth: []
 */
export const getDistrictById = async (req, res, next) => {
  try {
    const district = await District.findById(req.params.id).populate('province', 'name code');
    if (!district) {
      return res.status(404).json({ status: 'error', message: 'District not found' });
    }
    res.status(200).json({ status: 'success', data: { district } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/districts:
 *   post:
 *     summary: Create a new district (ADMIN only)
 *     tags: [Districts]
 *     security:
 *       - bearerAuth: []
 */
export const createDistrictValidation = [
  body('name').trim().notEmpty().withMessage('District name is required'),
  body('province').isMongoId().withMessage('Valid province ID is required'),
];

export const createDistrict = async (req, res, next) => {
  try {
    const { name, province } = req.body;
    const district = await District.create({ name, province });
    await district.populate('province', 'name code');
    res.status(201).json({ status: 'success', data: { district } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/districts/{id}:
 *   put:
 *     summary: Update a district (ADMIN only)
 *     tags: [Districts]
 *     security:
 *       - bearerAuth: []
 */
export const updateDistrictValidation = [
  param('id').isMongoId().withMessage('Invalid district ID'),
];

export const updateDistrict = async (req, res, next) => {
  try {
    const district = await District.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('province', 'name code');
    if (!district) {
      return res.status(404).json({ status: 'error', message: 'District not found' });
    }
    res.status(200).json({ status: 'success', data: { district } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/districts/{id}:
 *   delete:
 *     summary: Delete a district (ADMIN only)
 *     tags: [Districts]
 *     security:
 *       - bearerAuth: []
 */
export const deleteDistrict = async (req, res, next) => {
  try {
    const district = await District.findByIdAndDelete(req.params.id);
    if (!district) {
      return res.status(404).json({ status: 'error', message: 'District not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
