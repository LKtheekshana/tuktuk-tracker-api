import { body, param } from 'express-validator';
import User from '../models/User.js';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
export const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find().populate('station', 'name code').sort({ username: 1 });
    res.status(200).json({ status: 'success', results: users.length, data: { users } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('station', 'name code');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
export const updateUserValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('role').optional().isIn(['ADMIN', 'STATION_OFFICER', 'DEVICE']).withMessage('Invalid role'),
];

export const updateUser = async (req, res, next) => {
  try {
    // Disallow password updates through this endpoint — use a dedicated change-password endpoint
    delete req.body.password;

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
