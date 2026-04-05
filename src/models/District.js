import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     District:
 *       type: object
 *       required: [name, province]
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: Colombo
 *         province:
 *           type: string
 *           description: Province ObjectId
 *         createdAt:
 *           type: string
 *           format: date-time
 */
const districtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    province: { type: mongoose.Schema.Types.ObjectId, ref: 'Province', required: true },
  },
  { timestamps: true }
);

districtSchema.index({ name: 1, province: 1 }, { unique: true });

const District = mongoose.model('District', districtSchema);
export default District;
