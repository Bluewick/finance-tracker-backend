import mongoose from "mongoose";
import Budget from "../models/budget.model.js";
import Transaction from "../models/transaction.model.js";
import ApiError from "../utils/api_error.util.js";

const enrich_budget_with_spending = (budget_doc, category_spending_map, total_monthly_spent) => {
  const budget = budget_doc.toObject ? budget_doc.toObject() : budget_doc;
  const normalized_cat = (budget.category || "ALL").trim().toLowerCase();

  const actual_spent =
    normalized_cat === "all"
      ? Number(total_monthly_spent.toFixed(2))
      : Number((category_spending_map.get(normalized_cat) || 0).toFixed(2));

  const amount_limit = Number(budget.amount_limit.toFixed(2));
  const remaining = Number((amount_limit - actual_spent).toFixed(2));
  const percentage_used =
    amount_limit > 0
      ? Number(((actual_spent / amount_limit) * 100).toFixed(2))
      : 0;

  return {
    ...budget,
    amount_limit,
    actual_spent,
    remaining,
    percentage_used,
    is_exceeded: actual_spent > amount_limit,
  };
};

const get_monthly_spending_breakdown = async (user_id, month, year) => {
  const start_of_month = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end_of_month = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const aggregation = await Transaction.aggregate([
    {
      $match: {
        user_id: new mongoose.Types.ObjectId(user_id),
        type: "expense",
        date: {
          $gte: start_of_month,
          $lte: end_of_month,
        },
      },
    },
    {
      $group: {
        _id: { $toLower: "$category" },
        total_spent: { $sum: "$amount" },
      },
    },
  ]);

  const category_spending_map = new Map();
  let total_monthly_spent = 0;

  for (const item of aggregation) {
    category_spending_map.set(item._id, item.total_spent);
    total_monthly_spent += item.total_spent;
  }

  return {
    category_spending_map,
    total_monthly_spent,
  };
};

export const create_or_upsert_budget_service = async (
  user_id,
  { category = "ALL", amount_limit, month, year }
) => {
  const normalized_category = category.trim();

  const budget = await Budget.findOneAndUpdate(
    {
      user_id,
      month,
      year,
      category: {
        $regex: new RegExp(
          `^${normalized_category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i"
        ),
      },
    },
    {
      $set: {
        user_id,
        category: normalized_category,
        amount_limit: Number(amount_limit),
        month,
        year,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  const { category_spending_map, total_monthly_spent } =
    await get_monthly_spending_breakdown(user_id, month, year);

  return enrich_budget_with_spending(
    budget,
    category_spending_map,
    total_monthly_spent
  );
};

export const get_budgets_service = async (user_id, query_params = {}) => {
  const now = new Date();
  const month = query_params.month
    ? parseInt(query_params.month, 10)
    : now.getMonth() + 1;
  const year = query_params.year
    ? parseInt(query_params.year, 10)
    : now.getFullYear();

  if (Number.isNaN(month) || month < 1 || month > 12) {
    throw ApiError.bad_request(
      "Month must be an integer between 1 and 12.",
      [{ field: "month", message: "Invalid month parameter." }],
      "VALIDATION_ERROR"
    );
  }

  if (Number.isNaN(year) || year < 2000 || year > 2100) {
    throw ApiError.bad_request(
      "Year must be between 2000 and 2100.",
      [{ field: "year", message: "Invalid year parameter." }],
      "VALIDATION_ERROR"
    );
  }

  const [budgets, spending_data] = await Promise.all([
    Budget.find({ user_id, month, year }).sort({ category: 1 }).lean(),
    get_monthly_spending_breakdown(user_id, month, year),
  ]);

  const enriched_budgets = budgets.map((b) =>
    enrich_budget_with_spending(
      b,
      spending_data.category_spending_map,
      spending_data.total_monthly_spent
    )
  );

  return {
    month,
    year,
    total_monthly_spent: Number(spending_data.total_monthly_spent.toFixed(2)),
    budgets: enriched_budgets,
  };
};

export const update_budget_service = async (
  user_id,
  budget_id,
  { amount_limit, category }
) => {
  const budget = await Budget.findOne({ _id: budget_id, user_id });

  if (!budget) {
    throw ApiError.not_found("Budget not found.", [], "BUDGET_NOT_FOUND");
  }

  if (amount_limit !== undefined) {
    budget.amount_limit = Number(amount_limit);
  }

  if (category !== undefined) {
    budget.category = category.trim();
  }

  await budget.save();

  const { category_spending_map, total_monthly_spent } =
    await get_monthly_spending_breakdown(user_id, budget.month, budget.year);

  return enrich_budget_with_spending(
    budget,
    category_spending_map,
    total_monthly_spent
  );
};

export const delete_budget_service = async (user_id, budget_id) => {
  const budget = await Budget.findOneAndDelete({
    _id: budget_id,
    user_id,
  });

  if (!budget) {
    throw ApiError.not_found("Budget not found.", [], "BUDGET_NOT_FOUND");
  }

  return {
    id: budget._id.toString(),
    deleted: true,
  };
};

export default {
  create_or_upsert_budget_service,
  get_budgets_service,
  update_budget_service,
  delete_budget_service,
};

