import {
  registerUser,
  loginUser
} from "../services/auth.service.js";

import { AppError } from "../utils/app-error.js";

export async function register(req, res) {
  const result = await registerUser(req.body);

  if (result.error === "EMAIL_ALREADY_EXISTS") {
    throw new AppError("Email is already in use", 409);
  }

  res.status(201).json(result.user);
}

export async function login(req, res) {
  const result = await loginUser(req.body);

  if (result.error === "INVALID_CREDENTIALS") {
    throw new AppError("Invalid email or password", 401);
  }

  res.status(200).json(result);
}