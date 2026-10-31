import {
  create_transaction_service,
  get_transactions_service,
  get_transaction_by_id_service,
  update_transaction_service,
  delete_transaction_service,
  export_transactions_csv_service,
} from "../services/transaction.service.js";
import async_handler from "../utils/async_handler.util.js";
import { send_success } from "../utils/response.util.js";

export const create_transaction = async_handler(async (req, res) => {
  const transaction = await create_transaction_service(req.user.id, req.body);

  return send_success(res, {
    status_code: 201,
    message: "Transaction created successfully.",
    data: transaction,
  });
});

export const get_transactions = async_handler(async (req, res) => {
  const { transactions, meta } = await get_transactions_service(
    req.user.id,
    req.query
  );

  return send_success(res, {
    status_code: 200,
    message: "Transactions retrieved successfully.",
    data: transactions,
    meta,
  });
});

export const get_transaction_by_id = async_handler(async (req, res) => {
  const transaction = await get_transaction_by_id_service(
    req.user.id,
    req.params.id
  );

  return send_success(res, {
    status_code: 200,
    message: "Transaction retrieved successfully.",
    data: transaction,
  });
});

export const update_transaction = async_handler(async (req, res) => {
  const transaction = await update_transaction_service(
    req.user.id,
    req.params.id,
    req.body
  );

  return send_success(res, {
    status_code: 200,
    message: "Transaction updated successfully.",
    data: transaction,
  });
});

export const delete_transaction = async_handler(async (req, res) => {
  const result = await delete_transaction_service(req.user.id, req.params.id);

  return send_success(res, {
    status_code: 200,
    message: "Transaction deleted successfully.",
    data: result,
  });
});

export const export_transactions = async_handler(async (req, res) => {
  const csv_content = await export_transactions_csv_service(
    req.user.id,
    req.query
  );

  const date_stamp = new Date().toISOString().split("T")[0];
  const filename = `transactions_${date_stamp}.csv`;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  return res.status(200).send(csv_content);
});

export default {
  create_transaction,
  get_transactions,
  get_transaction_by_id,
  update_transaction,
  delete_transaction,
  export_transactions,
};

