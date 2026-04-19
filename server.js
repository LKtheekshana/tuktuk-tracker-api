import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
  });
}).catch((err) => {
  console.error('Failed to connect to DB:', err.message);
  process.exit(1);
});
