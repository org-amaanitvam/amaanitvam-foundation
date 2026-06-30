import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import User from './models/user.js';
import fs from 'fs';

async function test() {
  await connectDB();
  const user = await User.findOne({ email: 'test@gmail.com' });
  if (user) {
    user.profileImageBuffer = Buffer.from('hello world', 'utf8');
    user.profileImageContentType = 'text/plain';
    await user.save();
    console.log('Saved buffer for test@gmail.com');
  } else {
    console.log('No user found');
  }
  process.exit();
}
test();
