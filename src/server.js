import express from "express";
import cors from "cors";
import env from "./config/env.config.js";
import connect_db from "./config/db.js";
import auth_routes from "./routes/auth.routes.js";
import user_routes from "./routes/user.routes.js";
import transaction_routes from "./routes/transaction.routes.js";
import analytics_routes from "./routes/analytics.routes.js";
import budget_routes from "./routes/budget.routes.js";
import {
  not_found_middleware,
  error_middleware,
} from "./middleware/error.middleware.js";
import { send_success } from "./utils/response.util.js";

const app = express();

const allowed_origins = [
  env.cors_origin,
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5253",
  "http://localhost:3000",
].filter(Boolean);

const allowed_regex_patterns = [/^https:\/\/.*\.vercel\.app$/];

const cors_options = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const is_allowed =
      allowed_origins.includes(origin) ||
      allowed_regex_patterns.some((pattern) => pattern.test(origin));

    if (is_allowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy error: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-link-password"],
};

// Global Middleware
app.use(cors(cors_options));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health-check Routes
app.get("/", (req, res) => {
  return send_success(res, {
    status_code: 200,
    message: "Personal Finance Tracker Backend API is running.",
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

app.get("/api/health", (req, res) => {
  return send_success(res, {
    status_code: 200,
    message: "Server is healthy.",
    data: {
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// API Routes
app.use("/api/auth", auth_routes);
app.use("/api/users", user_routes);
app.use("/api/transactions", transaction_routes);
app.use("/api/analytics", analytics_routes);
app.use("/api/budgets", budget_routes);

// 404 & Centralized Error Handling Middleware
app.use(not_found_middleware);
app.use(error_middleware);

const start_server = async () => {
  await connect_db();

  app.listen(env.port, () => {
    console.log(`🚀 Server running on http://localhost:${env.port}`);
  });
};

start_server();

export default app;
