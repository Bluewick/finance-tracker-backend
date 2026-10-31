import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const User = mongoose.model("User", userSchema);

export const createUser = async (fullName, email, hashedPassword) => {
  const user = await User.create({
    full_name: fullName,
    email,
    password: hashedPassword,
  });

  return {
    id: user._id.toString(),
    full_name: user.full_name,
    email: user.email,
    created_at: user.created_at,
  };
};

export const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return null;

  return {
    id: user._id.toString(),
    full_name: user.full_name,
    email: user.email,
    password: user.password,
    created_at: user.created_at,
  };
};

export default User;
