import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  cancelReservation
} from "../services/reservation.service.js";

export async function getReservations(req, res) {
  const reservations = await getAllReservations();

  res.status(200).json(reservations);
}

export async function getReservation(req, res) {
  const id = Number(req.params.id);

  const reservation = await getReservationById(id);

  if (!reservation) {
    return res.status(404).json({
      message: "Reservation not found"
    });
  }

  res.status(200).json(reservation);
}

export async function createNewReservation(req, res) {
  const result = await createReservation(req.body);

  if (result.error === "RESOURCE_NOT_FOUND") {
    return res.status(404).json({
      message: "Resource not found"
    });
  }

  if (result.error === "USER_NOT_FOUND") {
    return res.status(404).json({
      message: "User not found"
    });
  }

  if (result.error === "RESOURCE_INACTIVE") {
    return res.status(409).json({
      message: "Resource is inactive"
    });
  }

  if (result.error === "INVALID_DATE_RANGE") {
    return res.status(400).json({
      message: "Start date must be before end date"
    });
  }

  if (result.error === "RESERVATION_IN_PAST") {
    return res.status(400).json({
      message: "Reservation cannot start in the past"
    });
  }

  if (result.error === "RESERVATION_CONFLICT") {
    return res.status(409).json({
      message: "Resource is already reserved for this time period"
    });
  }

  res.status(201).json(result.reservation);
}

export async function updateExistingReservation(req, res) {
  const id = Number(req.params.id);

  const result = await updateReservation(id, req.body);

  if (result.error === "RESERVATION_NOT_FOUND") {
    return res.status(404).json({
      message: "Reservation not found"
    });
  }

  if (result.error === "RESERVATION_CANCELLED") {
    return res.status(409).json({
      message: "Cancelled reservation cannot be updated"
    });
  }

  if (result.error === "RESERVATION_COMPLETED") {
    return res.status(409).json({
      message: "Completed reservation cannot be updated"
    });
  }

  if (result.error === "RESOURCE_NOT_FOUND") {
    return res.status(404).json({
      message: "Resource not found"
    });
  }

  if (result.error === "RESOURCE_INACTIVE") {
    return res.status(409).json({
      message: "Resource is inactive"
    });
  }

  if (result.error === "INVALID_DATE_RANGE") {
    return res.status(400).json({
      message: "Start date must be before end date"
    });
  }

  if (result.error === "RESERVATION_IN_PAST") {
    return res.status(400).json({
      message: "Reservation cannot start in the past"
    });
  }

  if (result.error === "RESERVATION_CONFLICT") {
    return res.status(409).json({
      message: "Resource is already reserved for this time period"
    });
  }

  res.status(200).json(result.reservation);
}

export async function cancelExistingReservation(req, res) {
  const id = Number(req.params.id);

  const result = await cancelReservation(id);

  if (result.error === "RESERVATION_NOT_FOUND") {
    return res.status(404).json({
      message: "Reservation not found"
    });
  }

  if (result.error === "ALREADY_CANCELLED") {
    return res.status(409).json({
      message: "Reservation is already cancelled"
    });
  }

  if (result.error === "RESERVATION_COMPLETED") {
    return res.status(409).json({
      message: "Completed reservation cannot be cancelled"
    });
  }

  res.status(200).json(result.reservation);
}