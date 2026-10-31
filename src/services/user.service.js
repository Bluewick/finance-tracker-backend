import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import ApiError from "../utils/api_error.util.js";
import { sanitize_user } from "./auth.service.js";

const SALT_ROUNDS = 10;

export const get_user_profile_service = async (user_id) => {
  const user = await User.findById(user_id);

  if (!user) {
    throw ApiError.not_found("User profile not found.", [], "USER_NOT_FOUND");
  }

  return sanitize_user(user);
};

export const update_user_profile_service = async (
  user_id,
  { name, email, currency }
) => {
  const user = await User.findById(user_id);

  if (!user) {
    throw ApiError.not_found("User profile not found.", [], "USER_NOT_FOUND");
  }

  if (email !== undefined && email !== user.email) {
    const email_exists = await User.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: user_id },
    });

    if (email_exists) {
      throw ApiError.conflict(
        "Email address is already in use by another account.",
        [{ field: "email", message: "Email is already registered." }],
        "EMAIL_ALREADY_EXISTS"
      );
    }

    user.email = email.trim().toLowerCase();
  }

  if (name !== undefined) {
    user.name = name.trim();
  }

  if (currency !== undefined) {
    user.currency = currency.trim().toUpperCase();
  }

  await user.save();

  return sanitize_user(user);
};

export const update_user_password_service = async (
  user_id,
  { current_password, new_password }
) => {
  const user = await User.findById(user_id);

  if (!user) {
    throw ApiError.not_found("User profile not found.", [], "USER_NOT_FOUND");
  }

  const is_password_valid = await bcrypt.compare(
    current_password,
    user.password_hash
  );

  if (!is_password_valid) {
    throw ApiError.bad_request(
      "Current password is incorrect.",
      [{ field: "current_password", message: "Incorrect current password." }],
      "INVALID_CURRENT_PASSWORD"
    );
  }

  const is_same_password = await bcrypt.compare(
    new_password,
    user.password_hash
  );
  if (is_same_password) {
    throw ApiError.bad_request(
      "New password must be different from your current password.",
      [
        {
          field: "new_password",
          message: "New password cannot be the same as current password.",
        },
      ],
      "PASSWORD_UNCHANGED"
    );
  }

  user.password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
  await user.save();

  return {
    updated_at: user.updatedAt,
  };
};

export default {
  get_user_profile_service,
  update_user_profile_service,
  update_user_password_service,
};

