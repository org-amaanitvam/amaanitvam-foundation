import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Setting from './models/setting.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await connectDB();
    const settings = await Setting.findOne();
    console.log(settings);
    process.exit(0);
};
run();
