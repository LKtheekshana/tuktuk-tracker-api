import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Verifies the Bearer JWT token in the Authorization header.
 * Attaches the authenticated user to req.user.
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'No token provided. Authorization denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ status: 'error', message: 'User not found or account disabled.' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
  }
};

/**
 * Restricts access to specified roles.
 * Must be used after protect middleware.
 * @param {...string} roles - Allowed roles e.g. 'ADMIN', 'STATION_OFFICER'
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      status: 'error',
      message: `Role '${req.user.role}' is not authorized to access this resource.`,
    });
  }
  next();
};
