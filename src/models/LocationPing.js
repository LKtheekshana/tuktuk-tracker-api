import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     LocationPing:
 *       type: object
 *       required: [vehicle, latitude, longitude]
 *       properties:
 *         _id:
 *           type: string
 *         vehicle:
 *           type: string
 *           description: Vehicle ObjectId
 *         latitude:
 *           type: number
 *           example: 6.9271
 *         longitude:
 *           type: number
 *           example: 79.8612
 *         speed:
 *           type: number
 *           example: 25.5
 *         heading:
 *           type: number
 *           example: 180
 *         timestamp:
 *           type: string
 *           format: date-time
 */
const locationPingSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    speed: { type: Number, min: 0 },
    heading: { type: Number, min: 0, max: 360 },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Index for fast time-window queries
locationPingSchema.index({ vehicle: 1, timestamp: -1 });
// TTL index - automatically purge pings older than 90 days
locationPingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

const LocationPing = mongoose.model('LocationPing', locationPingSchema);
export default LocationPing;
