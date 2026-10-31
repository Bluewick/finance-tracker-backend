import jwt from "jsonwebtoken";
import env from "../config/env.config.js";

export const generate_token = (user) => {
  return jwt.sign(
    {
      id: user._id ? user._id.toString() : user.id,
      email: user.email,
      role: user.role || "user",
    },
    env.jwt_secret,
    {
      expiresIn: env.jwt_expires_in,
    }
  );
};

export const generateToken = generate_token;
export default generate_token;
