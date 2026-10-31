import mongoose from "mongoose";
import ApiError from "../utils/api_error.util.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validate_object_id = (param_name = "id") => {
  return (req, res, next) => {
    const id_val = req.params[param_name];
    if (!id_val || !mongoose.Types.ObjectId.isValid(id_val)) {
      return next(
        ApiError.bad_request(
          `Invalid ${param_name} parameter.`,
          [{ field: param_name, message: "Must be a valid MongoDB ObjectId" }],
          "VALIDATION_ERROR"
        )
      );
    }
    next();
  };
};

export const validate_register = (req, res, next) => {
  const details = [];
  const { name, full_name, fullName, email, password, currency } = req.body || {};
  const resolved_name = name || full_name || fullName;

  if (!resolved_name || typeof resolved_name !== "string" || !resolved_name.trim()) {
    details.push({ field: "name", message: "Name is required." });
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    details.push({ field: "email", message: "A valid email address is required." });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    details.push({
      field: "password",
      message: "Password is required and must be at least 6 characters long.",
    });
  }

  if (currency !== undefined && (typeof currency !== "string" || !currency.trim())) {
    details.push({ field: "currency", message: "Currency must be a non-empty string." });
  }

  if (details.length > 0) {
    return next(
      ApiError.bad_request("Validation failed.", details, "VALIDATION_ERROR")
    );
  }

  req.body.name = resolved_name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

export const validate_login = (req, res, next) => {
  const details = [];
  const { email, password } = req.body || {};

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    details.push({ field: "email", message: "A valid email address is required." });
  }

  if (!password || typeof password !== "string" || !password) {
    details.push({ field: "password", message: "Password is required." });
  }

  if (details.length > 0) {
    return next(
      ApiError.bad_request("Validation failed.", details, "VALIDATION_ERROR")
    );
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

export const validate_profile_update = (req, res, next) => {
  const details = [];
  const { name, full_name, fullName, email, currency } = req.body || {};
  const resolved_name = name !== undefined ? name : full_name !== undefined ? full_name : fullName;

  if (
    resolved_name === undefined &&
    email === undefined &&
    currency === undefined
  ) {
    details.push({
      field: "body",
      message: "At least one field (name, email, or currency) must be provided.",
    });
  }

  if (
    resolved_name !== undefined &&
    (typeof resolved_name !== "string" || !resolved_name.trim())
  ) {
    details.push({ field: "name", message: "Name must be a non-empty string." });
  }

  if (
    email !== undefined &&
    (typeof email !== "string" || !EMAIL_REGEX.test(email.trim()))
  ) {
    details.push({ field: "email", message: "Email must be a valid email address." });
  }

  if (
    currency !== undefined &&
    (typeof currency !== "string" || !currency.trim())
  ) {
    details.push({ field: "currency", message: "Currency must be a non-empty string." });
  }

  if (details.length > 0) {
    return next(
      ApiError.bad_request("Validation failed.", details, "VALIDATION_ERROR")
    );
  }

  if (resolved_name !== undefined) {
    req.body.name = resolved_name.trim();
  }
  if (email !== undefined) {
    req.body.email = email.trim().toLowerCase();
  }
  if (currency !== undefined) {
    req.body.currency = currency.trim().toUpperCase();
  }

  next();
};

export const validate_password_update = (req, res, next) => {
  const details = [];
  const { current_password, currentPassword, new_password, newPassword } =
    req.body || {};

  const resolved_current = current_password || currentPassword;
  const resolved_new = new_password || newPassword;

  if (!resolved_current || typeof resolved_current !== "string") {
    details.push({
      field: "current_password",
      message: "Current password is required.",
    });
  }

  if (!resolved_new || typeof resolved_new !== "string" || resolved_new.length < 6) {
    details.push({
      field: "new_password",
      message: "New password is required and must be at least 6 characters long.",
    });
  }

  if (details.length > 0) {
    return next(
      ApiError.bad_request("Validation failed.", details, "VALIDATION_ERROR")
    );
  }

  req.body.current_password = resolved_current;
  req.body.new_password = resolved_new;
  next();
};

export const validate_create_transaction = (req, res, next) => {
  const details = [];
  const { type, category, amount, date, notes } = req.body || {};

  if (!type || !["income", "expense"].includes(type)) {
    details.push({
      field: "type",
      message: "Transaction type must be either 'income' or 'expense'.",
    });
  }

  if (!category || typeof category !== "string" || !category.trim()) {
    details.push({
      field: "category",
      message: "Transaction category is required.",
    });
  }

  const parsed_amount = Number(amount);
  if (amount === undefined || amount === null || Number.isNaN(parsed_amount) || parsed_amount <= 0) {
    details.push({
      field: "amount",
      message: "Transaction amount must be a positive number.",
    });
  }

  if (date !== undefined && date !== null && date !== "") {
    const parsed_date = new Date(date);
    if (Number.isNaN(parsed_date.getTime())) {
      details.push({
        field: "date",
        message: "Transaction date must be a valid ISO date.",
      });
    }
  }

  if (notes !== undefined && notes !== null && typeof notes !== "string") {
    details.push({
      field: "notes",
      message: "Notes must be a string.",
    });
  }

  if (details.length > 0) {
    return next(
      ApiError.bad_request("Validation failed.", details, "VALIDATION_ERROR")
    );
  }

  req.body.amount = parsed_amount;
  req.body.category = category.trim();
  if (notes !== undefined && notes !== null) {
    req.body.notes = notes.trim();
  }
  next();
};

export const validate_update_transaction = (req, res, next) => {
  const details = [];
  const { type, category, amount, date, notes } = req.body || {};

  if (
    type === undefined &&
    category === undefined &&
    amount === undefined &&
    date === undefined &&
    notes === undefined
  ) {
    details.push({
      field: "body",
      message: "At least one field (type, category, amount, date, or notes) must be provided.",
    });
  }

  if (type !== undefined && !["income", "expense"].includes(type)) {
    details.push({
      field: "type",
      message: "Transaction type must be either 'income' or 'expense'.",
    });
  }

  if (category !== undefined && (typeof category !== "string" || !category.trim())) {
    details.push({
      field: "category",
      message: "Transaction category must be a non-empty string.",
    });
  }

  if (amount !== undefined) {
    const parsed_amount = Number(amount);
    if (amount === null || Number.isNaN(parsed_amount) || parsed_amount <= 0) {
      details.push({
        field: "amount",
        message: "Transaction amount must be a positive number.",
      });
    } else {
      req.body.amount = parsed_amount;
    }
  }

  if (date !== undefined) {
    const parsed_date = new Date(date);
    if (!date || Number.isNaN(parsed_date.getTime())) {
      details.push({
        field: "date",
        message: "Transaction date must be a valid ISO date.",
      });
    }
  }

  if (notes !== undefined && notes !== null && typeof notes !== "string") {
    details.push({
      field: "notes",
      message: "Notes must be a string.",
    });
  }

  if (details.length > 0) {
    return next(
      ApiError.bad_request("Validation failed.", details, "VALIDATION_ERROR")
    );
  }

  if (category !== undefined) {
    req.body.category = category.trim();
  }
  if (typeof notes === "string") {
    req.body.notes = notes.trim();
  }
  next();
};

export const validate_transaction_query = (req, res, next) => {
  const details = [];
  const { type, start_date, end_date, page, limit } = req.query || {};

  if (type !== undefined && type !== "" && !["income", "expense"].includes(type)) {
    details.push({
      field: "type",
      message: "Query filter 'type' must be 'income' or 'expense'.",
    });
  }

  if (start_date !== undefined && start_date !== "") {
    const parsed = new Date(start_date);
    if (Number.isNaN(parsed.getTime())) {
      details.push({
        field: "start_date",
        message: "Query filter 'start_date' must be a valid date.",
      });
    }
  }

  if (end_date !== undefined && end_date !== "") {
    const parsed = new Date(end_date);
    if (Number.isNaN(parsed.getTime())) {
      details.push({
        field: "end_date",
        message: "Query filter 'end_date' must be a valid date.",
      });
    }
  }

  if (page !== undefined && page !== "") {
    const parsed_page = parseInt(page, 10);
    if (Number.isNaN(parsed_page) || parsed_page < 1) {
      details.push({
        field: "page",
        message: "Query parameter 'page' must be a positive integer.",
      });
    }
  }

  if (limit !== undefined && limit !== "") {
    const parsed_limit = parseInt(limit, 10);
    if (Number.isNaN(parsed_limit) || parsed_limit < 1 || parsed_limit > 500) {
      details.push({
        field: "limit",
        message: "Query parameter 'limit' must be an integer between 1 and 500.",
      });
    }
  }

  if (details.length > 0) {
    return next(
      ApiError.bad_request("Invalid query parameters.", details, "VALIDATION_ERROR")
    );
  }

  next();
};

export const validate_create_budget = (req, res, next) => {
  const details = [];
  const { category, amount_limit, amountLimit, month, year } = req.body || {};
  const resolved_limit = amount_limit !== undefined ? amount_limit : amountLimit;

  const parsed_limit = Number(resolved_limit);
  if (
    resolved_limit === undefined ||
    resolved_limit === null ||
    Number.isNaN(parsed_limit) ||
    parsed_limit <= 0
  ) {
    details.push({
      field: "amount_limit",
      message: "Budget amount_limit must be a positive number.",
    });
  }

  const now = new Date();
  const parsed_month = month !== undefined ? parseInt(month, 10) : now.getMonth() + 1;
  const parsed_year = year !== undefined ? parseInt(year, 10) : now.getFullYear();

  if (Number.isNaN(parsed_month) || parsed_month < 1 || parsed_month > 12) {
    details.push({
      field: "month",
      message: "Month must be an integer between 1 and 12.",
    });
  }

  if (Number.isNaN(parsed_year) || parsed_year < 2000 || parsed_year > 2100) {
    details.push({
      field: "year",
      message: "Year must be a valid 4-digit year between 2000 and 2100.",
    });
  }

  if (
    category !== undefined &&
    (typeof category !== "string" || !category.trim())
  ) {
    details.push({
      field: "category",
      message: "Category must be a non-empty string (or 'ALL').",
    });
  }

  if (details.length > 0) {
    return next(
      ApiError.bad_request("Validation failed.", details, "VALIDATION_ERROR")
    );
  }

  req.body.amount_limit = parsed_limit;
  req.body.month = parsed_month;
  req.body.year = parsed_year;
  req.body.category = category ? category.trim() : "ALL";
  next();
};

export const validate_update_budget = (req, res, next) => {
  const details = [];
  const { amount_limit, amountLimit, category } = req.body || {};
  const resolved_limit = amount_limit !== undefined ? amount_limit : amountLimit;

  if (resolved_limit === undefined && category === undefined) {
    details.push({
      field: "body",
      message: "At least amount_limit or category must be provided.",
    });
  }

  if (resolved_limit !== undefined) {
    const parsed_limit = Number(resolved_limit);
    if (
      resolved_limit === null ||
      Number.isNaN(parsed_limit) ||
      parsed_limit <= 0
    ) {
      details.push({
        field: "amount_limit",
        message: "Budget amount_limit must be a positive number.",
      });
    } else {
      req.body.amount_limit = parsed_limit;
    }
  }

  if (
    category !== undefined &&
    (typeof category !== "string" || !category.trim())
  ) {
    details.push({
      field: "category",
      message: "Category must be a non-empty string.",
    });
  } else if (category !== undefined) {
    req.body.category = category.trim();
  }

  if (details.length > 0) {
    return next(
      ApiError.bad_request("Validation failed.", details, "VALIDATION_ERROR")
    );
  }

  next();
};

export default {
  validate_object_id,
  validate_register,
  validate_login,
  validate_profile_update,
  validate_password_update,
  validate_create_transaction,
  validate_update_transaction,
  validate_transaction_query,
  validate_create_budget,
  validate_update_budget,
};

