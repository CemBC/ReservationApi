import express from "express";

import {
  getReservations,
  getReservation,
  createNewReservation,
  updateExistingReservation,
  cancelExistingReservation
} from "../controllers/reservation.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

import {
  getReservationsSchema,
  getReservationByIdSchema,
  createReservationSchema,
  updateReservationSchema,
  cancelReservationSchema
} from "../validators/reservation.validator.js";

const router = express.Router();

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Get reservations
 *     description: Users see their own reservations. Admins see all reservations.
 *     tags:
 *       - Reservations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - CANCELLED
 *             - COMPLETED
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reservations returned successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authenticate,
  validate(getReservationsSchema),
  asyncHandler(getReservations)
);

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     summary: Get reservation by id
 *     description: Users can access their own reservations. Admins can access all reservations.
 *     tags:
 *       - Reservations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reservation returned successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Reservation not found
 */
router.get(
  "/:id",
  authenticate,
  validate(getReservationByIdSchema),
  asyncHandler(getReservation)
);

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Create a reservation
 *     tags:
 *       - Reservations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resourceId
 *               - startDate
 *               - endDate
 *             properties:
 *               resourceId:
 *                 type: integer
 *                 example: 1
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-10-05T10:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-10-05T12:00:00.000Z"
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       400:
 *         description: Validation failed or invalid date range
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resource not found
 *       409:
 *         description: Reservation conflict or inactive resource
 */
router.post(
  "/",
  authenticate,
  validate(createReservationSchema),
  asyncHandler(createNewReservation)
);

/**
 * @swagger
 * /api/reservations/{id}:
 *   put:
 *     summary: Update a reservation
 *     description: Users can update their own reservations. Admins can update any reservation.
 *     tags:
 *       - Reservations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resourceId:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Reservation updated successfully
 *       400:
 *         description: Validation failed or invalid date range
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Reservation or resource not found
 *       409:
 *         description: Reservation conflict or invalid reservation state
 */
router.put(
  "/:id",
  authenticate,
  validate(updateReservationSchema),
  asyncHandler(updateExistingReservation)
);

/**
 * @swagger
 * /api/reservations/{id}/cancel:
 *   patch:
 *     summary: Cancel a reservation
 *     description: Users can cancel their own reservations. Admins can cancel any reservation.
 *     tags:
 *       - Reservations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Reservation not found
 *       409:
 *         description: Reservation is already cancelled or completed
 */
router.patch(
  "/:id/cancel",
  authenticate,
  validate(cancelReservationSchema),
  asyncHandler(cancelExistingReservation)
);

export default router;