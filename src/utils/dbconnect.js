import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL;
const DB_NAME = process.env.DB_NAME;

const dbConnect = async () => {
    if (!MONGODB_URI) {
        throw new Error("Database configuration is missing");
    }

    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    try {
        await mongoose.connect(MONGODB_URI, {
            dbName: DB_NAME,
            serverSelectionTimeoutMS: 10000,
        });
        return mongoose.connection;
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw new Error("Database connection failed");
    }
};

export default dbConnect;