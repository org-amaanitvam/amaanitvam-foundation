import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/user.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await connectDB();
    const users = await User.find({}, 'email role status');
    console.log(users);
    process.exit(0);
};
run();
