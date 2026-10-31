import mongoose from "mongoose";
import Transaction from "../models/transaction.model.js";
import ApiError from "../utils/api_error.util.js";

export const build_date_range_filter = (start_date, end_date) => {
  if (!start_date && !end_date) {
    return null;
  }

  const date_filter = {};

  if (start_date) {
    date_filter.$gte = new Date(start_date);
  }

  if (end_date) {
    const end = new Date(end_date);
    if (typeof end_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(end_date.trim())) {
      end.setUTCHours(23, 59, 59, 999);
    }
    date_filter.$lte = end;
  }

  return date_filter;
};

export const build_transaction_query = (user_id, query_params = {}) => {
  const { type, category, start_date, end_date, search } = query_params;

  const filter = {
    user_id: new mongoose.Types.ObjectId(user_id),
  };

  if (type && ["income", "expense"].includes(type)) {
    filter.type = type;
  }

  if (category && typeof category === "string" && category.trim()) {
    const categories = category
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    if (categories.length === 1) {
      filter.category = { $regex: new RegExp(`^${escape_regex(categories[0])}$`, "i") };
    } else if (categories.length > 1) {
      filter.category = {
        $in: categories.map((c) => new RegExp(`^${escape_regex(c)}$`, "i")),
      };
    }
  }

  const date_filter = build_date_range_filter(start_date, end_date);
  if (date_filter) {
    filter.date = date_filter;
  }

  if (search && typeof search === "string" && search.trim()) {
    const escaped_search = escape_regex(search.trim());
    filter.$or = [
      { notes: { $regex: escaped_search, $options: "i" } },
      { category: { $regex: escaped_search, $options: "i" } },
    ];
  }

  return filter;
};

const escape_regex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const create_transaction_service = async (
  user_id,
  { type, category, amount, date, notes }
) => {
  const transaction = await Transaction.create({
    user_id,
    type,
    category: category.trim(),
    amount: Number(amount),
    date: date ? new Date(date) : new Date(),
    notes: notes ? notes.trim() : "",
  });

  return transaction;
};

export const get_transactions_service = async (user_id, query_params = {}) => {
  const page = Math.max(1, parseInt(query_params.page, 10) || 1);
  const limit = Math.min(
    500,
    Math.max(1, parseInt(query_params.limit, 10) || 10)
  );
  const skip = (page - 1) * limit;

  const filter = build_transaction_query(user_id, query_params);

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  const total_pages = Math.ceil(total / limit) || 1;

  return {
    transactions,
    meta: {
      page,
      limit,
      total,
      total_pages,
    },
  };
};

export const get_transaction_by_id_service = async (user_id, transaction_id) => {
  const transaction = await Transaction.findOne({
    _id: transaction_id,
    user_id,
  });

  if (!transaction) {
    throw ApiError.not_found(
      "Transaction not found.",
      [],
      "TRANSACTION_NOT_FOUND"
    );
  }

  return transaction;
};

export const update_transaction_service = async (
  user_id,
  transaction_id,
  update_data
) => {
  const transaction = await Transaction.findOne({
    _id: transaction_id,
    user_id,
  });

  if (!transaction) {
    throw ApiError.not_found(
      "Transaction not found.",
      [],
      "TRANSACTION_NOT_FOUND"
    );
  }

  const allowed_fields = ["type", "category", "amount", "date", "notes"];
  for (const field of allowed_fields) {
    if (update_data[field] !== undefined) {
      if (field === "date") {
        transaction.date = new Date(update_data.date);
      } else if (field === "amount") {
        transaction.amount = Number(update_data.amount);
      } else if (field === "category") {
        transaction.category = update_data.category.trim();
      } else if (field === "notes") {
        transaction.notes =
          update_data.notes !== null ? String(update_data.notes).trim() : "";
      } else {
        transaction[field] = update_data[field];
      }
    }
  }

  await transaction.save();
  return transaction;
};

export const delete_transaction_service = async (user_id, transaction_id) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: transaction_id,
    user_id,
  });

  if (!transaction) {
    throw ApiError.not_found(
      "Transaction not found.",
      [],
      "TRANSACTION_NOT_FOUND"
    );
  }

  return {
    id: transaction._id.toString(),
    deleted: true,
  };
};

const escape_csv_field = (value) => {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
};

export const export_transactions_csv_service = async (
  user_id,
  query_params = {}
) => {
  const filter = build_transaction_query(user_id, query_params);

  const transactions = await Transaction.find(filter)
    .sort({ date: -1, createdAt: -1 })
    .lean();

  const headers = [
    "ID",
    "Date",
    "Type",
    "Category",
    "Amount",
    "Notes",
    "Created At",
  ];

  const rows = transactions.map((tx) => {
    const iso_date = tx.date ? new Date(tx.date).toISOString().split("T")[0] : "";
    const created_iso = tx.createdAt
      ? new Date(tx.createdAt).toISOString()
      : "";

    return [
      escape_csv_field(tx._id),
      escape_csv_field(iso_date),
      escape_csv_field(tx.type),
      escape_csv_field(tx.category),
      escape_csv_field(tx.amount),
      escape_csv_field(tx.notes || ""),
      escape_csv_field(created_iso),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
};

export default {
  build_date_range_filter,
  build_transaction_query,
  create_transaction_service,
  get_transactions_service,
  get_transaction_by_id_service,
  update_transaction_service,
  delete_transaction_service,
  export_transactions_csv_service,
};

