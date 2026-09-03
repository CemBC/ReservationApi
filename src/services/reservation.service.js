import prisma from "../config/prisma.js";

const reservationInclude = {
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true
    }
  },
  resource: true
};

export async function getReservationsFiltered(
  requester,
  options
) {
  const {
    page,
    limit,
    status,
    resourceId
  } = options;

  const where = {};

  if (requester.role !== "ADMIN") {
    where.userId = requester.userId;
  }

  if (status) {
    where.status = status;
  }

  if (resourceId) {
    where.resourceId = resourceId;
  }

  const skip = (page - 1) * limit;

  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      include: reservationInclude,
      orderBy: {
        startDate: "asc"
      },
      skip,
      take: limit
    }),

    prisma.reservation.count({
      where
    })
  ]);

  return {
    data: reservations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getReservationById(
  id,
  requester
) {
  const reservation =
    await prisma.reservation.findUnique({
      where: {
        id
      },
      include: reservationInclude
    });

  if (!reservation) {
    return {
      error: "RESERVATION_NOT_FOUND"
    };
  }

  if (
    requester.role !== "ADMIN" &&
    reservation.userId !== requester.userId
  ) {
    return {
      error: "FORBIDDEN"
    };
  }

  return {
    reservation
  };
}

export async function createReservation(data) {
  const resource =
    await prisma.resource.findUnique({
      where: {
        id: data.resourceId
      }
    });

  if (!resource) {
    return {
      error: "RESOURCE_NOT_FOUND"
    };
  }

  if (!resource.isActive) {
    return {
      error: "RESOURCE_INACTIVE"
    };
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: data.userId
      }
    });

  if (!user) {
    return {
      error: "USER_NOT_FOUND"
    };
  }

  const startDate = new Date(
    data.startDate
  );

  const endDate = new Date(
    data.endDate
  );

  if (startDate >= endDate) {
    return {
      error: "INVALID_DATE_RANGE"
    };
  }

  if (startDate < new Date()) {
    return {
      error: "RESERVATION_IN_PAST"
    };
  }

  const conflictingReservation =
    await prisma.reservation.findFirst({
      where: {
        resourceId: data.resourceId,
        status: "ACTIVE",

        startDate: {
          lt: endDate
        },

        endDate: {
          gt: startDate
        }
      }
    });

  if (conflictingReservation) {
    return {
      error: "RESERVATION_CONFLICT"
    };
  }

  const reservation =
    await prisma.reservation.create({
      data: {
        userId: data.userId,
        resourceId: data.resourceId,
        startDate,
        endDate
      }
    });

  return {
    reservation
  };
}

export async function updateReservation(
  id,
  data,
  requester
) {
  const existingReservation =
    await prisma.reservation.findUnique({
      where: {
        id
      }
    });

  if (!existingReservation) {
    return {
      error: "RESERVATION_NOT_FOUND"
    };
  }

  if (
    requester.role !== "ADMIN" &&
    existingReservation.userId !==
      requester.userId
  ) {
    return {
      error: "FORBIDDEN"
    };
  }

  if (
    existingReservation.status ===
    "CANCELLED"
  ) {
    return {
      error: "RESERVATION_CANCELLED"
    };
  }

  if (
    existingReservation.status ===
    "COMPLETED"
  ) {
    return {
      error: "RESERVATION_COMPLETED"
    };
  }

  const resourceId =
    data.resourceId ??
    existingReservation.resourceId;

  const startDate = data.startDate
    ? new Date(data.startDate)
    : existingReservation.startDate;

  const endDate = data.endDate
    ? new Date(data.endDate)
    : existingReservation.endDate;

  if (startDate >= endDate) {
    return {
      error: "INVALID_DATE_RANGE"
    };
  }

  if (startDate < new Date()) {
    return {
      error: "RESERVATION_IN_PAST"
    };
  }

  const resource =
    await prisma.resource.findUnique({
      where: {
        id: resourceId
      }
    });

  if (!resource) {
    return {
      error: "RESOURCE_NOT_FOUND"
    };
  }

  if (!resource.isActive) {
    return {
      error: "RESOURCE_INACTIVE"
    };
  }

  const conflictingReservation =
    await prisma.reservation.findFirst({
      where: {
        id: {
          not: id
        },

        resourceId,

        status: "ACTIVE",

        startDate: {
          lt: endDate
        },

        endDate: {
          gt: startDate
        }
      }
    });

  if (conflictingReservation) {
    return {
      error: "RESERVATION_CONFLICT"
    };
  }

  const reservation =
    await prisma.reservation.update({
      where: {
        id
      },

      data: {
        resourceId,
        startDate,
        endDate
      }
    });

  return {
    reservation
  };
}

export async function cancelReservation(
  id,
  requester
) {
  const reservation =
    await prisma.reservation.findUnique({
      where: {
        id
      }
    });

  if (!reservation) {
    return {
      error: "RESERVATION_NOT_FOUND"
    };
  }

  if (
    requester.role !== "ADMIN" &&
    reservation.userId !== requester.userId
  ) {
    return {
      error: "FORBIDDEN"
    };
  }

  if (
    reservation.status === "CANCELLED"
  ) {
    return {
      error: "ALREADY_CANCELLED"
    };
  }

  if (
    reservation.status === "COMPLETED"
  ) {
    return {
      error: "RESERVATION_COMPLETED"
    };
  }

  const updatedReservation =
    await prisma.reservation.update({
      where: {
        id
      },

      data: {
        status: "CANCELLED"
      }
    });

  return {
    reservation: updatedReservation
  };
}