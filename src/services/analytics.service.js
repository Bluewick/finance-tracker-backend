import mongoose from "mongoose";
import Transaction from "../models/transaction.model.js";
import { build_date_range_filter } from "./transaction.service.js";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const get_summary_analytics_service = async (
  user_id,
  { start_date, end_date, category } = {}
) => {
  const match_stage = {
    user_id: new mongoose.Types.ObjectId(user_id),
  };

  const date_filter = build_date_range_filter(start_date, end_date);
  if (date_filter) {
    match_stage.date = date_filter;
  }

  if (category && typeof category === "string" && category.trim()) {
    const categories = category
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (categories.length > 0) {
      match_stage.category = {
        $in: categories.map(
          (c) => new RegExp(`^${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
        ),
      };
    }
  }

  const results = await Transaction.aggregate([
    { $match: match_stage },
    {
      $group: {
        _id: "$type",
        total_amount: { $sum: "$amount" },
        transaction_count: { $sum: 1 },
      },
    },
  ]);

  let total_income = 0;
  let total_expense = 0;
  let income_count = 0;
  let expense_count = 0;

  for (const row of results) {
    if (row._id === "income") {
      total_income = Number(row.total_amount.toFixed(2));
      income_count = row.transaction_count;
    } else if (row._id === "expense") {
      total_expense = Number(row.total_amount.toFixed(2));
      expense_count = row.transaction_count;
    }
  }

  const net_balance = Number((total_income - total_expense).toFixed(2));
  const savings_rate =
    total_income > 0
      ? Number((((total_income - total_expense) / total_income) * 100).toFixed(2))
      : 0;

  return {
    total_income,
    total_expense,
    net_balance,
    savings_rate,
    transaction_counts: {
      income: income_count,
      expense: expense_count,
      total: income_count + expense_count,
    },
  };
};

export const get_category_breakdown_service = async (
  user_id,
  { type = "expense", start_date, end_date } = {}
) => {
  const valid_type = ["income", "expense"].includes(type) ? type : "expense";

  const match_stage = {
    user_id: new mongoose.Types.ObjectId(user_id),
    type: valid_type,
  };

  const date_filter = build_date_range_filter(start_date, end_date);
  if (date_filter) {
    match_stage.date = date_filter;
  }

  const breakdown = await Transaction.aggregate([
    { $match: match_stage },
    {
      $group: {
        _id: "$category",
        total_amount: { $sum: "$amount" },
        transaction_count: { $sum: 1 },
      },
    },
    { $sort: { total_amount: -1 } },
  ]);

  const grand_total = breakdown.reduce(
    (sum, item) => sum + item.total_amount,
    0
  );

  const categories = breakdown.map((item) => {
    const amount = Number(item.total_amount.toFixed(2));
    const percentage =
      grand_total > 0
        ? Number(((item.total_amount / grand_total) * 100).toFixed(2))
        : 0;

    return {
      category: item._id,
      amount,
      percentage,
      transaction_count: item.transaction_count,
    };
  });

  return {
    type: valid_type,
    grand_total: Number(grand_total.toFixed(2)),
    categories,
  };
};

export const get_monthly_trends_service = async (
  user_id,
  { year, start_date, end_date } = {}
) => {
  const match_stage = {
    user_id: new mongoose.Types.ObjectId(user_id),
  };

  const target_year = year ? parseInt(year, 10) : null;

  if (start_date || end_date) {
    const date_filter = build_date_range_filter(start_date, end_date);
    if (date_filter) {
      match_stage.date = date_filter;
    }
  } else if (target_year && !Number.isNaN(target_year)) {
    match_stage.date = {
      $gte: new Date(Date.UTC(target_year, 0, 1, 0, 0, 0, 0)),
      $lte: new Date(Date.UTC(target_year, 11, 31, 23, 59, 59, 999)),
    };
  } else {
    const current_year = new Date().getFullYear();
    match_stage.date = {
      $gte: new Date(Date.UTC(current_year, 0, 1, 0, 0, 0, 0)),
      $lte: new Date(Date.UTC(current_year, 11, 31, 23, 59, 59, 999)),
    };
  }

  const raw_trends = await Transaction.aggregate([
    { $match: match_stage },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total_amount: { $sum: "$amount" },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  // If filtering by a single year (default or specified), populate all 12 months
  if (!start_date && !end_date) {
    const resolved_year =
      target_year && !Number.isNaN(target_year)
        ? target_year
        : new Date().getFullYear();

    const monthly_map = new Map();
    for (let m = 1; m <= 12; m += 1) {
      monthly_map.set(m, {
        year: resolved_year,
        month: m,
        month_name: MONTH_NAMES[m - 1],
        label: `${MONTH_NAMES[m - 1]} ${resolved_year}`,
        income: 0,
        expense: 0,
        net_savings: 0,
      });
    }

    for (const item of raw_trends) {
      const m = item._id.month;
      const entry = monthly_map.get(m);
      if (entry) {
        if (item._id.type === "income") {
          entry.income = Number(item.total_amount.toFixed(2));
        } else if (item._id.type === "expense") {
          entry.expense = Number(item.total_amount.toFixed(2));
        }
        entry.net_savings = Number((entry.income - entry.expense).toFixed(2));
      }
    }

    return {
      year: resolved_year,
      trends: Array.from(monthly_map.values()),
    };
  }

  // Custom date range grouping
  const grouped_map = new Map();
  for (const item of raw_trends) {
    const y = item._id.year;
    const m = item._id.month;
    const key = `${y}-${String(m).padStart(2, "0")}`;

    if (!grouped_map.has(key)) {
      grouped_map.set(key, {
        year: y,
        month: m,
        month_name: MONTH_NAMES[m - 1],
        label: `${MONTH_NAMES[m - 1]} ${y}`,
        income: 0,
        expense: 0,
        net_savings: 0,
      });
    }

    const entry = grouped_map.get(key);
    if (item._id.type === "income") {
      entry.income = Number(item.total_amount.toFixed(2));
    } else if (item._id.type === "expense") {
      entry.expense = Number(item.total_amount.toFixed(2));
    }
    entry.net_savings = Number((entry.income - entry.expense).toFixed(2));
  }

  return {
    trends: Array.from(grouped_map.values()),
  };
};

export default {
  get_summary_analytics_service,
  get_category_breakdown_service,
  get_monthly_trends_service,
};

