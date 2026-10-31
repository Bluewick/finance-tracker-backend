import {
  get_summary_analytics_service,
  get_category_breakdown_service,
  get_monthly_trends_service,
} from "../services/analytics.service.js";
import async_handler from "../utils/async_handler.util.js";
import { send_success } from "../utils/response.util.js";

export const get_summary_analytics = async_handler(async (req, res) => {
  const summary = await get_summary_analytics_service(req.user.id, req.query);

  return send_success(res, {
    status_code: 200,
    message: "Financial summary retrieved successfully.",
    data: summary,
  });
});

export const get_category_breakdown = async_handler(async (req, res) => {
  const breakdown = await get_category_breakdown_service(
    req.user.id,
    req.query
  );

  return send_success(res, {
    status_code: 200,
    message: "Category breakdown retrieved successfully.",
    data: breakdown,
  });
});

export const get_monthly_trends = async_handler(async (req, res) => {
  const trends = await get_monthly_trends_service(req.user.id, req.query);

  return send_success(res, {
    status_code: 200,
    message: "Monthly trends retrieved successfully.",
    data: trends,
  });
});

export default {
  get_summary_analytics,
  get_category_breakdown,
  get_monthly_trends,
};

