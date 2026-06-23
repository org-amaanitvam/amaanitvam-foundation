// Run this script ONCE to seed the super admin user into MongoDB
// Usage: node scripts/seedAdmin.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/user.js";

dotenv.config();

const ADMIN_EMAIL = "tech.amaanitvam@gmail.com";
const ADMIN_NAME = "Amaanitvam Admin";

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            console.log(`Admin user already exists: ${existing.email} (role: ${existing.role})`);
            // Ensure the role is super_admin
            if (existing.role !== "super_admin") {
                existing.role = "super_admin";
                await existing.save();
                console.log("Updated role to super_admin");
            }
        } else {
            const admin = new User({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                role: "super_admin",
                status: "active",
                department: "Technology"
            });
            await admin.save();
            console.log(`Super admin created: ${ADMIN_EMAIL}`);
        }

        await mongoose.disconnect();
        console.log("Done. Disconnected from MongoDB.");
        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error);
        process.exit(1);
    }
}

seedAdmin();
