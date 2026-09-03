import { z } from "zod";

const idParamSchema = z.object({
  id: z.coerce
    .number()
    .int("Id must be an integer")
    .positive("Id must be positive")
});

const resourceQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10),

  isActive: z
    .enum(["true", "false"])
    .transform(value => value === "true")
    .optional(),

  location: z
    .string()
    .trim()
    .min(1)
    .optional(),

  search: z
    .string()
    .trim()
    .min(1)
    .optional()
});

export const getResourcesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: resourceQuerySchema
});

export const getResourceByIdSchema = z.object({
  body: z.object({}),
  params: idParamSchema,
  query: z.object({})
});

export const createResourceSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),

    description: z
      .string()
      .trim()
      .max(500, "Description must be at most 500 characters")
      .optional(),

    capacity: z
      .number()
      .int("Capacity must be an integer")
      .positive("Capacity must be greater than 0"),

    location: z
      .string()
      .trim()
      .min(2, "Location must be at least 2 characters")
      .max(100, "Location must be at most 100 characters"),

    isActive: z
      .boolean()
      .optional()
  }),

  params: z.object({}),
  query: z.object({})
});

export const updateResourceSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    description: z
      .string()
      .trim()
      .max(500)
      .optional(),

    capacity: z
      .number()
      .int()
      .positive()
      .optional(),

    location: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    isActive: z
      .boolean()
      .optional()
  }),

  params: idParamSchema,
  query: z.object({})
});

export const deleteResourceSchema = z.object({
  body: z.object({}),
  params: idParamSchema,
  query: z.object({})
});