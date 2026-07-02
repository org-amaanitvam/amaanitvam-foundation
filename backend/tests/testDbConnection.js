import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("URI:", process.env.MONGO_URI);

try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected");
} catch (err) {
    console.error(err);
}