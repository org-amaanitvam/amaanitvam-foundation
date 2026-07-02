import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/user.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await connectDB();
    const emails = ['admin@amaanitvam.org', 'amaanitvam@gmail.com', 'tech.amaanitvam@gmail.com'];
    for (const email of emails) {
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name: "Amaanitvam Admin",
                email: email,
                role: "admin",
                status: "active",
                department: "Technology"
            });
            await user.save();
            console.log(`Created admin: ${email}`);
        } else {
            console.log(`Admin exists: ${email}`);
        }
    }
    process.exit(0);
};
run();
