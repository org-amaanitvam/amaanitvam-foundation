import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Attendance from './models/attendance.js';

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('No Mongo URI');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(uri);
  const docs = await Attendance.find().limit(10).lean();
  console.log('count', docs.length);
  console.log(JSON.stringify(docs, null, 2));
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
