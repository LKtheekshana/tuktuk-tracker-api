import { body, param } from 'express-validator';
import Province from '../models/Province.js';

/**
 * @swagger
 * /api/provinces:
 *   get:
 *     summary: Get all provinces
 *     tags: [Provinces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all 9 provinces
 */
export const getProvinces = async (_req, res, next) => {
  try {
    const provinces = await Province.find().sort({ name: 1 });
    res.status(200).json({ status: 'success', results: provinces.length, data: { provinces } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/provinces/{id}:
 *   get:
 *     summary: Get a single province by ID
 *     tags: [Provinces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Province details
 *       404:
 *         description: Province not found
 */
export const getProvinceById = async (req, res, next) => {
  try {
    const province = await Province.findById(req.params.id);
    if (!province) {
      return res.status(404).json({ status: 'error', message: 'Province not found' });
    }
    res.status(200).json({ status: 'success', data: { province } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/provinces:
 *   post:
 *     summary: Create a new province (ADMIN only)
 *     tags: [Provinces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Province'
 *     responses:
 *       201:
 *         description: Province created
 *       409:
 *         description: Province already exists
 */
export const createProvinceValidation = [
  body('name').trim().notEmpty().withMessage('Province name is required'),
  body('code').trim().notEmpty().withMessage('Province code is required'),
];

export const createProvince = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    const province = await Province.create({ name, code });
    res.status(201).json({ status: 'success', data: { province } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/provinces/{id}:
 *   put:
 *     summary: Update a province (ADMIN only)
 *     tags: [Provinces]
 *     security:
 *       - bearerAuth: []
 */
export const updateProvinceValidation = [
  param('id').isMongoId().withMessage('Invalid province ID'),
];

export const updateProvince = async (req, res, next) => {
  try {
    const province = await Province.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!province) {
      return res.status(404).json({ status: 'error', message: 'Province not found' });
    }
    res.status(200).json({ status: 'success', data: { province } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/provinces/{id}:
 *   delete:
 *     summary: Delete a province (ADMIN only)
 *     tags: [Provinces]
 *     security:
 *       - bearerAuth: []
 */
export const deleteProvince = async (req, res, next) => {
  try {
    const province = await Province.findByIdAndDelete(req.params.id);
    if (!province) {
      return res.status(404).json({ status: 'error', message: 'Province not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
