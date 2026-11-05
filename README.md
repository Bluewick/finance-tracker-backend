# Personal Finance Tracker API

A modular, production-ready RESTful backend API for personal finance tracking built with Node.js, Express, MongoDB, and Mongoose. It supports JWT-based authentication, transaction management, categorical budgeting with limits, and comprehensive spending analytics.

---

## Features

- **Authentication & Security**
  - Secure user registration and login with password hashing via `bcrypt`.
  - Stateless JSON Web Token (JWT) authentication and route protection middleware.
  - Cross-Origin Resource Sharing (CORS) configured for frontend integration.
- **User Account Management**
  - Profile retrieval and profile updates.
  - Secure password changes with old-password verification.
  - Preferred currency selection (default: INR).
- **Transaction Tracking**
  - Record income and expense entries with amount, category, date, and notes.
  - Filterable transaction history (by type, category, date range).
  - Transaction data export support.
- **Budget Management**
  - Set category-specific and overall monthly spending limits.
  - Multi-year and multi-month budget allocations.
  - Unique compound indexing preventing duplicate budget entries per period.
- **Financial Analytics & Insights**
  - Summary metrics: total income, total expenses, and net cash balance.
  - Category-by-category spending breakdowns.
  - Monthly financial trend analysis.
- **Robust Architecture**
  - Strict 3-tier Controller-Service-Model architecture.
  - Centralized error management with custom `ApiError` class and global error middleware.
  - Express asynchronous route handler utility (`asyncHandler`) eliminating boilerplate try-catch blocks.
  - Standardized JSON envelope format for all API responses.

---

## Tech Stack

| Component | Technology | Version / Specification |
| :--- | :--- | :--- |
| **Runtime** | Node.js | v18+ (ES Modules / `"type": "module"`) |
| **Framework** | Express.js | `^4.21.2` |
| **Database** | MongoDB | v6.0+ |
| **ODM** | Mongoose | `^8.9.5` |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | `^9.0.2` |
| **Password Hashing** | Bcrypt | `^5.1.1` |
| **Configuration** | Dotenv | `^16.4.7` |
| **CORS** | Cors | `^2.8.5` |
| **Dev Server** | Nodemon | `^3.1.9` |

---

## Project Structure

```text
finance-tracker-backend/
├── .gitignore
├── package-lock.json
├── package.json
└── src/
    ├── config/
    │   ├── db.js                # MongoDB connection management
    │   └── env.config.js        # Environment variable validation & exports
    ├── controllers/             # HTTP request handling & response mapping
    │   ├── analytics.controller.js
    │   ├── auth.controller.js
    │   ├── budget.controller.js
    │   ├── transaction.controller.js
    │   └── user.controller.js
    ├── middleware/              # Interceptors & guards
    │   ├── auth.middleware.js     # Bearer token validation
    │   ├── error.middleware.js    # Global 404 & exception handler
    │   └── validate.middleware.js # Request payload validation
    ├── models/                  # Mongoose data schemas & validation
    │   ├── budget.model.js
    │   ├── transaction.model.js
    │   └── user.model.js
    ├── routes/                  # Express route declarations
    │   ├── analytics.routes.js
    │   ├── auth.routes.js
    │   ├── budget.routes.js
    │   ├── transaction.routes.js
    │   └── user.routes.js
    ├── services/                # Business logic & database operations
    │   ├── analytics.service.js
    │   ├── auth.service.js
    │   ├── budget.service.js
    │   ├── transaction.service.js
    │   └── user.service.js
    ├── utils/                   # Shared utility helpers
    │   ├── api_error.util.js      # Custom operational error wrapper
    │   ├── async_handler.util.js  # Async middleware error forwarder
    │   ├── jwt.js                 # JWT sign and verify helpers
    │   └── response.util.js       # Standardized JSON response builder
    └── server.js                # Express app initialization & server entry
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** instance (local running instance or MongoDB Atlas cluster URI)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Bluewick/finance-tracker-backend.git
   cd finance-tracker-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   *(Or create `.env` manually using the variables below).*

4. Start the application:
   - **Development mode (with auto-reload):**
     ```bash
     npm run dev
     ```
   - **Production mode:**
     ```bash
     npm start
     ```

The server starts by default at `http://localhost:5213`.

---

## Environment Variables

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5213` | Port on which the Express server listens |
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `production`, `test`) |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string (e.g., `mongodb://localhost:27017/finance_tracker`) |
| `JWT_SECRET` | **Yes** | — | Strong secret key used for signing JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry duration (e.g., `1d`, `7d`, `24h`) |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed origin for Cross-Origin requests (e.g., Vite/React frontend) |

---

## API Reference

All protected endpoints require an `Authorization` header containing a valid Bearer token:
```text
Authorization: Bearer <your_jwt_token>
```

### System & Health

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/` | No | Root server status |
| `GET` | `/api/health` | No | Server health check and uptime |

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | No | Register a new user account |
| `POST` | `/api/auth/login` | No | Authenticate user & receive JWT |
| `POST` | `/api/auth/logout` | Yes | Invalidate / clear session context |

#### Register Payload Example
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "currency": "INR"
}
```

#### Login Payload Example
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```

### User Management (`/api/users`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/users/me` | Yes | Get authenticated user profile |
| `PATCH` | `/api/users/me` | Yes | Update profile name or preferred currency |
| `PATCH` | `/api/users/me/password` | Yes | Change current account password |

### Transactions (`/api/transactions`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/transactions` | Yes | Create an income or expense transaction |
| `GET` | `/api/transactions` | Yes | List transactions with optional query filters |
| `GET` | `/api/transactions/export` | Yes | Export transaction history |
| `GET` | `/api/transactions/:id` | Yes | Retrieve details of a specific transaction |
| `PATCH` | `/api/transactions/:id` | Yes | Update an existing transaction |
| `DELETE` | `/api/transactions/:id` | Yes | Delete a transaction |

#### Create Transaction Payload Example
```json
{
  "type": "expense",
  "category": "Groceries",
  "amount": 1450.50,
  "date": "2026-11-05T00:00:00.000Z",
  "notes": "Weekly supermarket essentials"
}
```

### Budgets (`/api/budgets`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/budgets` | Yes | Set a monthly category or overall budget |
| `GET` | `/api/budgets` | Yes | Retrieve all budgets for the authenticated user |
| `PATCH` | `/api/budgets/:id` | Yes | Update budget amount limit |
| `DELETE` | `/api/budgets/:id` | Yes | Remove a budget entry |

#### Create Budget Payload Example
```json
{
  "category": "Dining Out",
  "amount_limit": 5000,
  "month": 11,
  "year": 2026
}
```

### Analytics (`/api/analytics`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/analytics/summary` | Yes | Overview of total income, expenses, and net balance |
| `GET` | `/api/analytics/category-breakdown` | Yes | Breakdown of spending across categories |
| `GET` | `/api/analytics/monthly-trends` | Yes | Month-over-month trend analysis |

---

## Response & Error Format

The API delivers standardized JSON responses across all endpoints.

### Success Response Envelope
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": "6729adbc0912ab0012345678",
    "type": "expense",
    "category": "Groceries",
    "amount": 1450.50,
    "date": "2026-11-05T00:00:00.000Z",
    "notes": "Weekly supermarket essentials"
  }
}
```

### Error Response Envelope
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": []
}
```

Common HTTP status codes returned:
- `200 OK` — Request succeeded.
- `201 Created` — Resource created successfully.
- `400 Bad Request` — Validation failed or missing parameters.
- `401 Unauthorized` — Token missing, invalid, or expired.
- `403 Forbidden` — Insufficient resource permissions.
- `404 Not Found` — Requested entity or endpoint does not exist.
- `409 Conflict` — Duplicate resource (e.g., email already registered or budget conflict).
- `500 Internal Server Error` — Unhandled server exception.

---

## Database Schemas

### User Schema (`User`)
- `name` (String, required, trimmed)
- `email` (String, required, unique, lowercase, trimmed)
- `password_hash` (String, required)
- `currency` (String, default: `"INR"`, uppercase)
- `role` (String, enum: `["user", "admin"]`, default: `"user"`)
- `timestamps` (`createdAt`, `updatedAt`)

### Transaction Schema (`Transaction`)
- `user_id` (ObjectId, ref: `User`, required, indexed)
- `type` (String, enum: `["income", "expense"]`, required)
- `category` (String, required, trimmed)
- `amount` (Number, required, min: `0.01`)
- `date` (Date, required, default: `Date.now`)
- `notes` (String, trimmed, default: `""`)
- **Indexes:** `{ user_id: 1, date: -1 }`, `{ user_id: 1, type: 1, category: 1 }`

### Budget Schema (`Budget`)
- `user_id` (ObjectId, ref: `User`, required, indexed)
- `category` (String, required, default: `"ALL"`)
- `amount_limit` (Number, required, min: `0.01`)
- `month` (Number, required, `1` to `12`)
- `year` (Number, required, `2000` to `2100`)
- **Compound Unique Index:** `{ user_id: 1, year: 1, month: 1, category: 1 }`

---

## License

This project is licensed under the ISC License. See the repository for further details.
