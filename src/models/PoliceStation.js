import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     PoliceStation:
 *       type: object
 *       required: [name, code, district]
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: Colombo Fort Police Station
 *         code:
 *           type: string
 *           example: CMB-FORT
 *         district:
 *           type: string
 *           description: District ObjectId
 *         province:
 *           type: string
 *           description: Province ObjectId (denormalized for fast filtering)
 *         address:
 *           type: string
 *         contactNumber:
 *           type: string
 */
const policeStationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    district: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    province: { type: mongoose.Schema.Types.ObjectId, ref: 'Province', required: true },
    address: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
  },
  { timestamps: true }
);

const PoliceStation = mongoose.model('PoliceStation', policeStationSchema);
export default PoliceStation;
