import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import User from '../models/User.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (ADMIN only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, role]
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string, minLength: 8 }
 *               role: { type: string, enum: [ADMIN, STATION_OFFICER, DEVICE] }
 *               station: { type: string, description: "Required for STATION_OFFICER" }
 *               vehicle: { type: string, description: "Required for DEVICE" }
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: Username already exists
 */
export const registerValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['ADMIN', 'STATION_OFFICER', 'DEVICE']).withMessage('Invalid role'),
];

export const register = async (req, res, next) => {
  try {
    const { username, email, password, role, station, vehicle } = req.body;

    const user = await User.create({ username, email, password, role, station, vehicle });

    res.status(201).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
export const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user || !user.isActive) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      data: {
        token,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Not authenticated
 */
export const getMe = (req, res) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
};
