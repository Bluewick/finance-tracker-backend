export class ApiError extends Error {
  constructor(
    status_code,
    message,
    code = "INTERNAL_SERVER_ERROR",
    details = [],
    is_operational = true
  ) {
    super(message);
    this.status_code = status_code;
    this.code = code;
    this.details = details;
    this.is_operational = is_operational;

    Error.captureStackTrace(this, this.constructor);
  }

  static bad_request(message = "Bad Request", details = [], code = "BAD_REQUEST") {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(
    message = "Invalid or expired token.",
    details = [],
    code = "UNAUTHORIZED_ACCESS"
  ) {
    return new ApiError(401, message, code, details);
  }

  static forbidden(
    message = "Access denied. Insufficient permissions.",
    details = [],
    code = "FORBIDDEN_ACCESS"
  ) {
    return new ApiError(403, message, code, details);
  }

  static not_found(
    message = "Requested resource not found.",
    details = [],
    code = "RESOURCE_NOT_FOUND"
  ) {
    return new ApiError(404, message, code, details);
  }

  static conflict(
    message = "Resource already exists.",
    details = [],
    code = "RESOURCE_CONFLICT"
  ) {
    return new ApiError(409, message, code, details);
  }

  static internal(
    message = "An unexpected internal server error occurred.",
    details = [],
    code = "INTERNAL_SERVER_ERROR"
  ) {
    return new ApiError(500, message, code, details, false);
  }
}

export default ApiError;

