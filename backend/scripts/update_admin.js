import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/user.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await connectDB();
    await User.updateOne({ email: 'tech.amaanitvam@gmail.com' }, { $set: { name: 'Kartik Admin' } });
    console.log('Updated Admin name');
    process.exit(0);
};
run();
