import express from "express";
import {
  register_user,
  login_user,
  logout_user,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {
  validate_register,
  validate_login,
} from "../middleware/validate.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", validate_register, register_user);
router.post("/signup", validate_register, register_user);
router.post("/login", validate_login, login_user);

// Protected route
router.post("/logout", authenticateUser, logout_user);

export default router;
