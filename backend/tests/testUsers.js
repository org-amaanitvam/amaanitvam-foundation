import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/user.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await connectDB();
    const users = await User.find({});
    console.log(users.map(u => ({ email: u.email, name: u.name, role: u.role })));
    process.exit(0);
};
run();