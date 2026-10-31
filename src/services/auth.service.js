import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import env from "../config/env.config.js";
import ApiError from "../utils/api_error.util.js";

const SALT_ROUNDS = 10;

export const generate_jwt_token = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    env.jwt_secret,
    {
      expiresIn: env.jwt_expires_in,
    }
  );
};

export const sanitize_user = (user) => {
  return {
    id: user._id.toString(),
    _id: user._id,
    name: user.name,
    email: user.email,
    currency: user.currency,
    role: user.role,
    is_active: user.is_active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const register_user_service = async ({
  name,
  email,
  password,
  currency,
}) => {
  const normalized_email = email.trim().toLowerCase();

  const existing_user = await User.findOne({ email: normalized_email });
  if (existing_user) {
    throw ApiError.conflict(
      "An account with this email already exists.",
      [{ field: "email", message: "Email is already registered." }],
      "EMAIL_ALREADY_EXISTS"
    );
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const new_user = await User.create({
    name: name.trim(),
    email: normalized_email,
    password_hash,
    currency: currency ? currency.trim().toUpperCase() : "INR",
    role: "user",
    is_active: true,
  });

  const token = generate_jwt_token(new_user);

  return {
    user: sanitize_user(new_user),
    token,
  };
};

export const login_user_service = async ({ email, password }) => {
  const normalized_email = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalized_email });
  if (!user) {
    throw ApiError.unauthorized(
      "Invalid email or password.",
      [],
      "INVALID_CREDENTIALS"
    );
  }

  if (!user.is_active) {
    throw ApiError.forbidden(
      "Your account has been deactivated. Please contact support.",
      [],
      "ACCOUNT_DEACTIVATED"
    );
  }

  const is_password_valid = await bcrypt.compare(password, user.password_hash);
  if (!is_password_valid) {
    throw ApiError.unauthorized(
      "Invalid email or password.",
      [],
      "INVALID_CREDENTIALS"
    );
  }

  const token = generate_jwt_token(user);

  return {
    user: sanitize_user(user),
    token,
  };
};

export const logout_user_service = async (user_id) => {
  return {
    user_id,
    logged_out_at: new Date().toISOString(),
  };
};

export default {
  generate_jwt_token,
  sanitize_user,
  register_user_service,
  login_user_service,
  logout_user_service,
};
