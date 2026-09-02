import express from "express";

import {
  getReservations,
  getReservation,
  createNewReservation,
  updateExistingReservation,
  cancelExistingReservation
} from "../controllers/reservation.controller.js";

const router = express.Router();

router.get("/", getReservations);
router.get("/:id", getReservation);
router.post("/", createNewReservation);
router.put("/:id", updateExistingReservation);
router.patch("/:id/cancel", cancelExistingReservation);

export default router;