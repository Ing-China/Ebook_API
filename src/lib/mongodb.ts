import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log(process.env.MONGODB_URI);

    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
};

export default connectDB;
