import express from "express";
import {
  get_user_profile,
  update_user_profile,
  update_user_password,
} from "../controllers/user.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {
  validate_profile_update,
  validate_password_update,
} from "../middleware/validate.middleware.js";

const router = express.Router();

// All user profile routes require authentication
router.use(authenticateUser);

router.get("/me", get_user_profile);
router.patch("/me", validate_profile_update, update_user_profile);
router.patch("/me/password", validate_password_update, update_user_password);

export default router;

