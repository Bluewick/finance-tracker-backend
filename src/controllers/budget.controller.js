import {
  create_or_upsert_budget_service,
  get_budgets_service,
  update_budget_service,
  delete_budget_service,
} from "../services/budget.service.js";
import async_handler from "../utils/async_handler.util.js";
import { send_success } from "../utils/response.util.js";

export const create_budget = async_handler(async (req, res) => {
  const budget = await create_or_upsert_budget_service(req.user.id, req.body);

  return send_success(res, {
    status_code: 201,
    message: "Budget saved successfully.",
    data: budget,
  });
});

export const get_budgets = async_handler(async (req, res) => {
  const result = await get_budgets_service(req.user.id, req.query);

  return send_success(res, {
    status_code: 200,
    message: "Budgets retrieved successfully.",
    data: result,
  });
});

export const update_budget = async_handler(async (req, res) => {
  const updated_budget = await update_budget_service(
    req.user.id,
    req.params.id,
    req.body
  );

  return send_success(res, {
    status_code: 200,
    message: "Budget updated successfully.",
    data: updated_budget,
  });
});

export const delete_budget = async_handler(async (req, res) => {
  const result = await delete_budget_service(req.user.id, req.params.id);

  return send_success(res, {
    status_code: 200,
    message: "Budget deleted successfully.",
    data: result,
  });
});

export default {
  create_budget,
  get_budgets,
  update_budget,
  delete_budget,
};

