import { registerUser , loginUser } from "../services/auth.service.js";

export async function register(req, res) {
  const result = await registerUser(req.body);

  if (result.error === "EMAIL_ALREADY_EXISTS") {
    return res.status(409).json({
      message: "Email is already in use"
    });
  }

  res.status(201).json(result.user);
}

export async function login(req, res) {
  const result = await loginUser(req.body);

  if (result.error === "INVALID_CREDENTIALS") {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  res.status(200).json(result);
}