import {
  get_user_profile_service,
  update_user_profile_service,
  update_user_password_service,
} from "../services/user.service.js";
import async_handler from "../utils/async_handler.util.js";
import { send_success } from "../utils/response.util.js";

export const get_user_profile = async_handler(async (req, res) => {
  const profile = await get_user_profile_service(req.user.id);

  return send_success(res, {
    status_code: 200,
    message: "User profile retrieved successfully.",
    data: profile,
  });
});

export const update_user_profile = async_handler(async (req, res) => {
  const updated_profile = await update_user_profile_service(
    req.user.id,
    req.body
  );

  return send_success(res, {
    status_code: 200,
    message: "User profile updated successfully.",
    data: updated_profile,
  });
});

export const update_user_password = async_handler(async (req, res) => {
  const result = await update_user_password_service(req.user.id, req.body);

  return send_success(res, {
    status_code: 200,
    message: "Password updated successfully.",
    data: result,
  });
});

export default {
  get_user_profile,
  update_user_profile,
  update_user_password,
};

