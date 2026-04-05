import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Province:
 *       type: object
 *       required: [name, code]
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: Western Province
 *         code:
 *           type: string
 *           example: WP
 *         createdAt:
 *           type: string
 *           format: date-time
 */
const provinceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  },
  { timestamps: true }
);

const Province = mongoose.model('Province', provinceSchema);
export default Province;
