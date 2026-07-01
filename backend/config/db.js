import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Connected Successfully!");
  } catch (err) {
    console.error(err);
  }
};

export default connectDB;