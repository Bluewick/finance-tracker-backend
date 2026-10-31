import {
  register_user_service,
  login_user_service,
  logout_user_service,
} from "../services/auth.service.js";
import async_handler from "../utils/async_handler.util.js";
import { send_success } from "../utils/response.util.js";

export const register_user = async_handler(async (req, res) => {
  const result = await register_user_service(req.body);

  return send_success(res, {
    status_code: 201,
    message: "User registered successfully.",
    data: result,
  });
});

export const login_user = async_handler(async (req, res) => {
  const result = await login_user_service(req.body);

  return send_success(res, {
    status_code: 200,
    message: "Login successful.",
    data: result,
  });
});

export const logout_user = async_handler(async (req, res) => {
  const result = await logout_user_service(req.user.id);

  return send_success(res, {
    status_code: 200,
    message: "Logged out successfully.",
    data: result,
  });
});

export default {
  register_user,
  login_user,
  logout_user,
};
