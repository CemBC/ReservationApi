import express from "express";

import {
  getReservations,
  getReservation,
  createNewReservation,
  updateExistingReservation,
  cancelExistingReservation
} from "../controllers/reservation.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getReservations);
router.get("/:id", authenticate, getReservation);
router.post("/", authenticate, createNewReservation);
router.put("/:id", authenticate, updateExistingReservation);
router.patch("/:id/cancel", authenticate, cancelExistingReservation);

export default router;