import { z } from "zod";

const idParamSchema = z.object({
  id: z.coerce
    .number()
    .int("Id must be an integer")
    .positive("Id must be positive")
});

const dateSchema = z
  .string()
  .datetime({
    message: "Invalid date format. Use ISO 8601 format"
  });

const reservationQuerySchema = z.object({
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

  status: z
    .enum([
      "ACTIVE",
      "CANCELLED",
      "COMPLETED"
    ])
    .optional(),

  resourceId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
});

export const getReservationsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: reservationQuerySchema
});

export const getReservationByIdSchema = z.object({
  body: z.object({}),
  params: idParamSchema,
  query: z.object({})
});

export const createReservationSchema = z.object({
  body: z.object({
    resourceId: z
      .number()
      .int("Resource id must be an integer")
      .positive("Resource id must be positive"),

    startDate: dateSchema,

    endDate: dateSchema
  }),

  params: z.object({}),
  query: z.object({})
});

export const updateReservationSchema = z.object({
  body: z.object({
    resourceId: z
      .number()
      .int()
      .positive()
      .optional(),

    startDate: dateSchema.optional(),

    endDate: dateSchema.optional()
  }),

  params: idParamSchema,
  query: z.object({})
});

export const cancelReservationSchema = z.object({
  body: z.object({}),
  params: idParamSchema,
  query: z.object({})
});