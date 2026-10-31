import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: "ALL",
    },
    amount_limit: {
      type: Number,
      required: true,
      min: [0.01, "Budget limit must be greater than zero."],
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index(
  { user_id: 1, year: 1, month: 1, category: 1 },
  { unique: true }
);

export const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;

