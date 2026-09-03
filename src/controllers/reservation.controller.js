import {
  getReservationsFiltered,
  getReservationById,
  createReservation,
  updateReservation,
  cancelReservation
} from "../services/reservation.service.js";

import { AppError } from "../utils/app-error.js";

function throwReservationError(error) {
  const errors = {
    RESERVATION_NOT_FOUND: [
      "Reservation not found",
      404
    ],

    RESOURCE_NOT_FOUND: [
      "Resource not found",
      404
    ],

    USER_NOT_FOUND: [
      "User not found",
      404
    ],

    FORBIDDEN: [
      "Forbidden",
      403
    ],

    RESOURCE_INACTIVE: [
      "Resource is inactive",
      409
    ],

    INVALID_DATE_RANGE: [
      "Start date must be before end date",
      400
    ],

    RESERVATION_IN_PAST: [
      "Reservation cannot start in the past",
      400
    ],

    RESERVATION_CONFLICT: [
      "Resource is already reserved for this time period",
      409
    ],

    RESERVATION_CANCELLED: [
      "Cancelled reservation cannot be updated",
      409
    ],

    ALREADY_CANCELLED: [
      "Reservation is already cancelled",
      409
    ],

    RESERVATION_COMPLETED: [
      "Completed reservation cannot be modified",
      409
    ]
  };

  const mappedError = errors[error];

  if (!mappedError) {
    throw new AppError(
      "Unexpected reservation error",
      500
    );
  }

  const [message, statusCode] =
    mappedError;

  throw new AppError(
    message,
    statusCode
  );
}

export async function getReservations(
  req,
  res
) {
  const result =
    await getReservationsFiltered(
      req.user,
      req.validated.query
    );

  res.status(200).json(result);
}

export async function getReservation(
  req,
  res
) {
  const id = Number(req.params.id);

  const result =
    await getReservationById(
      id,
      req.user
    );

  if (result.error) {
    throwReservationError(
      result.error
    );
  }

  res
    .status(200)
    .json(result.reservation);
}

export async function createNewReservation(
  req,
  res
) {
  const data = {
    ...req.body,
    userId: req.user.userId
  };

  const result =
    await createReservation(data);

  if (result.error) {
    throwReservationError(
      result.error
    );
  }

  res
    .status(201)
    .json(result.reservation);
}

export async function updateExistingReservation(
  req,
  res
) {
  const id = Number(req.params.id);

  const result =
    await updateReservation(
      id,
      req.body,
      req.user
    );

  if (result.error) {
    throwReservationError(
      result.error
    );
  }

  res
    .status(200)
    .json(result.reservation);
}

export async function cancelExistingReservation(
  req,
  res
) {
  const id = Number(req.params.id);

  const result =
    await cancelReservation(
      id,
      req.user
    );

  if (result.error) {
    throwReservationError(
      result.error
    );
  }

  res
    .status(200)
    .json(result.reservation);
}