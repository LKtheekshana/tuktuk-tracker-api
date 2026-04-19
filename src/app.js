import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createHash } from 'crypto';

import { swaggerSpec, swaggerUi } from './swagger/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import provinceRoutes from './routes/provinceRoutes.js';
import districtRoutes from './routes/districtRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
app.set('etag', false);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again in 15 minutes.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many authentication attempts, please try again in 15 minutes.' },
});

// Security & parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Conditional GET support for JSON endpoints using ETag and If-None-Match.
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    next();
    return;
  }

  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (res.statusCode < 200 || res.statusCode >= 300 || !body || typeof body !== 'object') {
      return originalJson(body);
    }

    const payload = JSON.stringify(body);
    const etag = `"${createHash('sha1').update(payload).digest('hex')}"`;
    const ifNoneMatch = req.headers['if-none-match'];

    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');

    if (typeof ifNoneMatch === 'string') {
      const matches = ifNoneMatch
        .split(',')
        .map((tag) => tag.trim().replace(/^W\//, ''))
        .includes(etag);

      if (matches) {
        return res.status(304).end();
      }
    }

    return originalJson(body);
  };

  next();
});

// Apply rate limiting to all API routes; stricter limit on auth login
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Resource not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
