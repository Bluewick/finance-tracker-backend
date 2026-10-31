import express from "express";
import {
  get_summary_analytics,
  get_category_breakdown,
  get_monthly_trends,
} from "../controllers/analytics.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { validate_transaction_query } from "../middleware/validate.middleware.js";

const router = express.Router();

// Protect all analytics routes
router.use(authenticateUser);

router.get("/summary", validate_transaction_query, get_summary_analytics);
router.get(
  "/category-breakdown",
  validate_transaction_query,
  get_category_breakdown
);
router.get("/monthly-trends", validate_transaction_query, get_monthly_trends);

export default router;

