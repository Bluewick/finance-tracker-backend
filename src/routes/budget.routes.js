import express from "express";
import {
  create_budget,
  get_budgets,
  update_budget,
  delete_budget,
} from "../controllers/budget.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {
  validate_create_budget,
  validate_update_budget,
  validate_object_id,
} from "../middleware/validate.middleware.js";

const router = express.Router();

// Protect all budget routes
router.use(authenticateUser);

router.post("/", validate_create_budget, create_budget);
router.get("/", get_budgets);
router.patch(
  "/:id",
  validate_object_id("id"),
  validate_update_budget,
  update_budget
);
router.delete("/:id", validate_object_id("id"), delete_budget);

export default router;

