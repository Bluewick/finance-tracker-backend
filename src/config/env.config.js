import dotenv from "dotenv";

dotenv.config();

const env = {
  node_env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 5213,
  mongo_uri: process.env.MONGODB_URI || process.env.MONGO_URI,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires_in: process.env.JWT_EXPIRES_IN || "7d",
  cors_origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173",
};

export const validate_env = () => {
  const missing_vars = [];

  if (!env.mongo_uri) {
    missing_vars.push("MONGODB_URI (or MONGO_URI)");
  }

  if (!env.jwt_secret) {
    missing_vars.push("JWT_SECRET");
  }

  if (missing_vars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing_vars.join(", ")}`
    );
  }
};

export default env;

