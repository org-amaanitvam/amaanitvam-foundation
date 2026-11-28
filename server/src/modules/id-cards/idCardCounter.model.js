import mongoose from 'mongoose';

const idCardCounterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false },
);

const IdCardCounter =
  mongoose.models.IdCardCounter ||
  mongoose.model('IdCardCounter', idCardCounterSchema);

export default IdCardCounter;