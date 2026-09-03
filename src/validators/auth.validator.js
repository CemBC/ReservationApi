import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be at most 100 characters"),

    email: z
      .email("Invalid email address")
      .trim(),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be at most 100 characters")
  }),

  params: z.object({}),
  query: z.object({})
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .email("Invalid email address")
      .trim(),

    password: z
      .string()
      .min(1, "Password is required")
  }),

  params: z.object({}),
  query: z.object({})
});