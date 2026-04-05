import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Vehicle:
 *       type: object
 *       required: [registrationNumber, driverName, driverNIC, district, province]
 *       properties:
 *         _id:
 *           type: string
 *         registrationNumber:
 *           type: string
 *           example: WP CAB-1234
 *         driverName:
 *           type: string
 *           example: Kamal Perera
 *         driverNIC:
 *           type: string
 *           example: 901234567V
 *         district:
 *           type: string
 *         province:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         lastLocation:
 *           type: object
 *           properties:
 *             latitude: { type: number }
 *             longitude: { type: number }
 *             timestamp: { type: string, format: date-time }
 */
const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    driverName: { type: String, required: true, trim: true },
    driverNIC: { type: String, required: true, unique: true, trim: true },
    district: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    province: { type: mongoose.Schema.Types.ObjectId, ref: 'Province', required: true },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    lastLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      timestamp: { type: Date },
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ province: 1, district: 1, status: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
