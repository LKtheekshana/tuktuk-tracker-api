import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tuk-Tuk Tracker API',
      version: '1.0.0',
      description:
        'RESTful API for real-time three-wheeler (tuk-tuk) tracking and movement logging for Sri Lanka Law Enforcement. ' +
        'Built for NB6007CEM Web API Development coursework.',
      contact: {
        name: 'API Support',
        email: 'admin@police.lk',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://your-deployed-app.onrender.com'
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from POST /api/auth/login',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication and user session management' },
      { name: 'Provinces', description: 'Sri Lanka administrative provinces (9 total)' },
      { name: 'Districts', description: 'Sri Lanka districts (25 total)' },
      { name: 'Stations', description: 'Police station management' },
      { name: 'Vehicles', description: 'Tuk-tuk vehicle registration and location tracking' },
      { name: 'Users', description: 'User account management (Admin only)' },
    ],
  },
  apis: [
    path.join(__dirname, '../controllers/*.js'),
    path.join(__dirname, '../models/*.js'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerUi = swaggerUiExpress;
