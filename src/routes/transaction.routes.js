import express from "express";
import {
  create_transaction,
  get_transactions,
  get_transaction_by_id,
  update_transaction,
  delete_transaction,
  export_transactions,
} from "../controllers/transaction.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {
  validate_create_transaction,
  validate_update_transaction,
  validate_transaction_query,
  validate_object_id,
} from "../middleware/validate.middleware.js";

const router = express.Router();

// Protect all transaction routes
router.use(authenticateUser);

router.post("/", validate_create_transaction, create_transaction);
router.get("/", validate_transaction_query, get_transactions);
router.get("/export", validate_transaction_query, export_transactions);
router.get("/:id", validate_object_id("id"), get_transaction_by_id);
router.patch(
  "/:id",
  validate_object_id("id"),
  validate_update_transaction,
  update_transaction
);
router.delete("/:id", validate_object_id("id"), delete_transaction);

export default router;

