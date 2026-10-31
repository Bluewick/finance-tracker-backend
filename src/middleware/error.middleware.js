import mongoose from "mongoose";
import ApiError from "../utils/api_error.util.js";
import { send_error } from "../utils/response.util.js";

export const not_found_middleware = (req, res, next) => {
  next(
    ApiError.not_found(
      `Route not found: ${req.method} ${req.originalUrl}`,
      [],
      "ROUTE_NOT_FOUND"
    )
  );
};

export const error_middleware = (err, req, res, next) => {
  let status_code = err.status_code || 500;
  let code = err.code || "INTERNAL_SERVER_ERROR";
  let message = err.message || "Internal Server Error";
  let details = err.details || [];

  // Handle Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    status_code = 400;
    code = "INVALID_OBJECT_ID";
    message = `Invalid ${err.path}: ${err.value}`;
    details = [{ field: err.path, message: `Invalid format for ${err.path}` }];
  }

  // Handle Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    status_code = 400;
    code = "VALIDATION_ERROR";
    message = "Validation failed on one or more fields.";
    details = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // Handle MongoDB Duplicate Key Error (11000)
  if (err.code === 11000) {
    status_code = 409;
    code = "DUPLICATE_RESOURCE";
    const duplicate_fields = Object.keys(err.keyPattern || {});
    message =
      duplicate_fields.length > 0
        ? `Duplicate value entered for ${duplicate_fields.join(", ")}.`
        : "Duplicate resource already exists.";
    details = duplicate_fields.map((field) => ({
      field,
      message: `${field} already exists`,
    }));
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status_code = 401;
    code = "UNAUTHORIZED_ACCESS";
    message = "Invalid or expired token.";
  }

  if (status_code === 500) {
    console.error("❌ Unhandled Error:", err);
  }

  return send_error(res, {
    status_code,
    code,
    message,
    details,
  });
};

export default error_middleware;

