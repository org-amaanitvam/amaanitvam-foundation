import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("MONGO_URI not set. Running in development offline mode.");
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB Connection Notice: ${error.message}`);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
    console.log("Proceeding with server startup in development mode...");
  }
};
