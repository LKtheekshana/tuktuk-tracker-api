import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required: [username, password, role]
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *           example: officer_colombo
 *         email:
 *           type: string
 *           example: officer@police.lk
 *         role:
 *           type: string
 *           enum: [ADMIN, STATION_OFFICER, DEVICE]
 *         station:
 *           type: string
 *           description: PoliceStation ObjectId (for STATION_OFFICER role)
 *         vehicle:
 *           type: string
 *           description: Vehicle ObjectId (for DEVICE role)
 *         isActive:
 *           type: boolean
 */
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'STATION_OFFICER', 'DEVICE'],
      required: true,
    },
    station: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation' },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare plain password against hash
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Never expose password in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
