import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import env from "../config/env.config.js";

dotenv.config();

export const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing.",
        error: {
          code: "UNAUTHORIZED_ACCESS",
          message: "Authorization header missing.",
          details: [],
        },
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
        error: {
          code: "UNAUTHORIZED_ACCESS",
          message: "Invalid authorization format.",
          details: [],
        },
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing.",
        error: {
          code: "UNAUTHORIZED_ACCESS",
          message: "Token missing.",
          details: [],
        },
      });
    }

    const decoded = jwt.verify(token, env.jwt_secret || process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      error: {
        code: "UNAUTHORIZED_ACCESS",
        message: "Invalid or expired token.",
        details: [],
      },
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
        error: {
          code: "UNAUTHORIZED_ACCESS",
          message: "Unauthorized.",
          details: [],
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden.",
        error: {
          code: "FORBIDDEN_ACCESS",
          message: "Forbidden.",
          details: [],
        },
      });
    }

    next();
  };
};

export const authenticate_user = authenticateUser;
export const authorize_roles = authorize;
export default { authenticateUser, authorize, authenticate_user, authorize_roles };
