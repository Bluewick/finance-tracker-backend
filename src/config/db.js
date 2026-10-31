import mongoose from "mongoose";
import env, { validate_env } from "./env.config.js";

const connect_db = async () => {
  try {
    validate_env();

    const conn = await mongoose.connect(env.mongo_uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB Atlas");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose connection disconnected");
});

export { connect_db };
export default connect_db;
