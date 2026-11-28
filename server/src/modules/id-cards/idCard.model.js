import mongoose from 'mongoose';

export const APPROVED_ID_POSITIONS = [
  'Managing Director',
  'Director',
  'Core Team Member',
  'Department Head',
  'Program Coordinator',
  'Volunteer',
  'Intern',
];

const idCardSchema = new mongoose.Schema(
  {
    sequenceNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    idNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    position: {
      type: String,
      required: true,
      enum: APPROVED_ID_POSITIONS,
      trim: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    issuedBy: {
      uid: { type: String, default: '' },
      name: { type: String, default: '' },
      email: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  },
);

const IdCard =
  mongoose.models.IdCard || mongoose.model('IdCard', idCardSchema);

export default IdCard;