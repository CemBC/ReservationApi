import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";
import { cleanDatabase } from "./test-utils.js";

describe("Reservation API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function createUserAndLogin(email) {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Test User",
        email,
        password: "123456"
      });

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "123456"
      });

    return {
      user: registerResponse.body,
      token: loginResponse.body.token
    };
  }

  async function createResource(overrides = {}) {
    return await prisma.resource.create({
      data: {
        name: "Meeting Room A",
        description: "Test meeting room",
        capacity: 6,
        location: "Floor 1",
        isActive: true,
        ...overrides
      }
    });
  }

  test("USER should be able to create a reservation", async () => {
    const { user, token } =
      await createUserAndLogin("user1@example.com");

    const resource = await createResource();

    const response = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        resourceId: resource.id,
        startDate: "2030-10-05T10:00:00.000Z",
        endDate: "2030-10-05T12:00:00.000Z"
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.userId).toBe(user.id);
    expect(response.body.resourceId).toBe(resource.id);
    expect(response.body.status).toBe("ACTIVE");
  });

  test("Overlapping reservation should return 409", async () => {
    const firstUser =
      await createUserAndLogin("user1@example.com");

    const secondUser =
      await createUserAndLogin("user2@example.com");

    const resource = await createResource();

    const firstResponse = await request(app)
      .post("/api/reservations")
      .set(
        "Authorization",
        `Bearer ${firstUser.token}`
      )
      .send({
        resourceId: resource.id,
        startDate: "2030-10-05T10:00:00.000Z",
        endDate: "2030-10-05T12:00:00.000Z"
      });

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await request(app)
      .post("/api/reservations")
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      )
      .send({
        resourceId: resource.id,
        startDate: "2030-10-05T11:00:00.000Z",
        endDate: "2030-10-05T13:00:00.000Z"
      });

    expect(secondResponse.statusCode).toBe(409);

    expect(secondResponse.body.message).toBe(
      "Resource is already reserved for this time period"
    );
  });

  test("Back-to-back reservations should be allowed", async () => {
    const firstUser =
      await createUserAndLogin("user1@example.com");

    const secondUser =
      await createUserAndLogin("user2@example.com");

    const resource = await createResource();

    const firstResponse = await request(app)
      .post("/api/reservations")
      .set(
        "Authorization",
        `Bearer ${firstUser.token}`
      )
      .send({
        resourceId: resource.id,
        startDate: "2030-10-05T10:00:00.000Z",
        endDate: "2030-10-05T12:00:00.000Z"
      });

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await request(app)
      .post("/api/reservations")
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      )
      .send({
        resourceId: resource.id,
        startDate: "2030-10-05T12:00:00.000Z",
        endDate: "2030-10-05T14:00:00.000Z"
      });

    expect(secondResponse.statusCode).toBe(201);
  });

  test("USER should not access another user's reservation", async () => {
    const firstUser =
      await createUserAndLogin("user1@example.com");

    const secondUser =
      await createUserAndLogin("user2@example.com");

    const resource = await createResource();

    const createResponse = await request(app)
      .post("/api/reservations")
      .set(
        "Authorization",
        `Bearer ${firstUser.token}`
      )
      .send({
        resourceId: resource.id,
        startDate: "2030-10-05T10:00:00.000Z",
        endDate: "2030-10-05T12:00:00.000Z"
      });

    expect(createResponse.statusCode).toBe(201);

    const reservationId = createResponse.body.id;

    const response = await request(app)
      .get(`/api/reservations/${reservationId}`)
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      );

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Forbidden");
  });

  test("USER should be able to cancel their own reservation", async () => {
    const { token } =
      await createUserAndLogin("user1@example.com");

    const resource = await createResource();

    const createResponse = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        resourceId: resource.id,
        startDate: "2030-10-05T10:00:00.000Z",
        endDate: "2030-10-05T12:00:00.000Z"
      });

    const reservationId = createResponse.body.id;

    const response = await request(app)
      .patch(`/api/reservations/${reservationId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("CANCELLED");
  });

  test("Inactive resource should not be reservable", async () => {
    const { token } =
      await createUserAndLogin("user1@example.com");

    const resource = await createResource({
      isActive: false
    });

    const response = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        resourceId: resource.id,
        startDate: "2030-10-05T10:00:00.000Z",
        endDate: "2030-10-05T12:00:00.000Z"
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe(
      "Resource is inactive"
    );
  });

  test("Reservation should fail when end date is before start date", async () => {
    const { token } =
      await createUserAndLogin("user1@example.com");

    const resource = await createResource();

    const response = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        resourceId: resource.id,
        startDate: "2030-10-05T12:00:00.000Z",
        endDate: "2030-10-05T10:00:00.000Z"
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Start date must be before end date"
    );
  });

  test("Reservation should not be created in the past", async () => {
    const { token } =
      await createUserAndLogin("user1@example.com");

    const resource = await createResource();

    const response = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        resourceId: resource.id,
        startDate: "2020-10-05T10:00:00.000Z",
        endDate: "2020-10-05T12:00:00.000Z"
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Reservation cannot start in the past"
    );
  });

  test("Reservation should fail when resource does not exist", async () => {
    const { token } =
      await createUserAndLogin("user1@example.com");

    const response = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        resourceId: 999999,
        startDate: "2030-10-05T10:00:00.000Z",
        endDate: "2030-10-05T12:00:00.000Z"
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe(
      "Resource not found"
    );
  });

  test("USER should not update another user's reservation", async () => {
    const firstUser =
      await createUserAndLogin("user1@example.com");

    const secondUser =
      await createUserAndLogin("user2@example.com");

    const resource = await createResource();

    const createResponse = await request(app)
      .post("/api/reservations")
      .set(
        "Authorization",
        `Bearer ${firstUser.token}`
      )
      .send({
        resourceId: resource.id,
        startDate: "2030-10-05T10:00:00.000Z",
        endDate: "2030-10-05T12:00:00.000Z"
      });

    const reservationId = createResponse.body.id;

    const response = await request(app)
      .put(`/api/reservations/${reservationId}`)
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      )
      .send({
        startDate: "2030-10-05T13:00:00.000Z",
        endDate: "2030-10-05T15:00:00.000Z"
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Forbidden");
  });

  test("Updating reservation into conflicting time should return 409", async () => {
    const firstUser =
      await createUserAndLogin("user1@example.com");

    const secondUser =
      await createUserAndLogin("user2@example.com");

    const resource = await createResource();

    const firstReservation = await request(app)
      .post("/api/reservations")
      .set(
        "Authorization",
        `Bearer ${firstUser.token}`
      )
      .send({
        resourceId: resource.id,
        startDate: "2030-10-05T10:00:00.000Z",
        endDate: "2030-10-05T12:00:00.000Z"
      });

    expect(firstReservation.statusCode).toBe(201);

    const secondReservation = await request(app)
      .post("/api/reservations")
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      )
      .send({
        resourceId: resource.id,
        startDate: "2030-10-05T14:00:00.000Z",
        endDate: "2030-10-05T16:00:00.000Z"
      });

    expect(secondReservation.statusCode).toBe(201);

    const response = await request(app)
      .put(
        `/api/reservations/${secondReservation.body.id}`
      )
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      )
      .send({
        startDate: "2030-10-05T11:00:00.000Z",
        endDate: "2030-10-05T13:00:00.000Z"
      });

    expect(response.statusCode).toBe(409);

    expect(response.body.message).toBe(
      "Resource is already reserved for this time period"
    );
  });

  test("Cancelled reservation should not be updated", async () => {
    const { token } =
      await createUserAndLogin("user1@example.com");

    const resource = await createResource();

    const createResponse = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        resourceId: resource.id,
        startDate: "2030-10-05T10:00:00.000Z",
        endDate: "2030-10-05T12:00:00.000Z"
      });

    const reservationId = createResponse.body.id;

    const cancelResponse = await request(app)
      .patch(`/api/reservations/${reservationId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(cancelResponse.statusCode).toBe(200);

    const response = await request(app)
      .put(`/api/reservations/${reservationId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        startDate: "2030-10-05T14:00:00.000Z",
        endDate: "2030-10-05T16:00:00.000Z"
      });

    expect(response.statusCode).toBe(409);

    expect(response.body.message).toBe(
      "Cancelled reservation cannot be updated"
    );
  });

  test("Cancelling an already cancelled reservation should return 409", async () => {
    const { token } =
      await createUserAndLogin("user1@example.com");

    const resource = await createResource();

    const createResponse = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        resourceId: resource.id,
        startDate: "2030-10-05T10:00:00.000Z",
        endDate: "2030-10-05T12:00:00.000Z"
      });

    const reservationId = createResponse.body.id;

    const firstCancel = await request(app)
      .patch(`/api/reservations/${reservationId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(firstCancel.statusCode).toBe(200);

    const secondCancel = await request(app)
      .patch(`/api/reservations/${reservationId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(secondCancel.statusCode).toBe(409);

    expect(secondCancel.body.message).toBe(
      "Reservation is already cancelled"
    );
  });

  test("USER should only see their own reservations", async () => {
    const firstUser =
      await createUserAndLogin("user1@example.com");

    const secondUser =
      await createUserAndLogin("user2@example.com");

    const resource1 = await createResource({
      name: "Room One"
    });

    const resource2 = await createResource({
      name: "Room Two"
    });

    await request(app)
      .post("/api/reservations")
      .set(
        "Authorization",
        `Bearer ${firstUser.token}`
      )
      .send({
        resourceId: resource1.id,
        startDate: "2030-10-05T10:00:00.000Z",
        endDate: "2030-10-05T12:00:00.000Z"
      });

    await request(app)
      .post("/api/reservations")
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      )
      .send({
        resourceId: resource2.id,
        startDate: "2030-10-05T13:00:00.000Z",
        endDate: "2030-10-05T15:00:00.000Z"
      });

    const response = await request(app)
      .get("/api/reservations")
      .set(
        "Authorization",
        `Bearer ${firstUser.token}`
      );

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].userId).toBe(
      firstUser.user.id
    );
  });
  test("Completed reservation should not be updated", async () => {
  const { user, token } =
    await createUserAndLogin("user1@example.com");

  const resource = await createResource();

  const reservation = await prisma.reservation.create({
    data: {
      userId: user.id,
      resourceId: resource.id,
      startDate: new Date("2030-10-05T10:00:00.000Z"),
      endDate: new Date("2030-10-05T12:00:00.000Z"),
      status: "COMPLETED"
    }
  });

  const response = await request(app)
    .put(`/api/reservations/${reservation.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      startDate: "2030-10-05T14:00:00.000Z",
      endDate: "2030-10-05T16:00:00.000Z"
    });

  expect(response.statusCode).toBe(409);
  expect(response.body.message).toBe(
    "Completed reservation cannot be modified"
  );
});

test("Completed reservation should not be cancelled", async () => {
  const { user, token } =
    await createUserAndLogin("user1@example.com");

  const resource = await createResource();

  const reservation = await prisma.reservation.create({
    data: {
      userId: user.id,
      resourceId: resource.id,
      startDate: new Date("2030-10-05T10:00:00.000Z"),
      endDate: new Date("2030-10-05T12:00:00.000Z"),
      status: "COMPLETED"
    }
  });

  const response = await request(app)
    .patch(`/api/reservations/${reservation.id}/cancel`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(409);
  expect(response.body.message).toBe(
    "Completed reservation cannot be modified"
  );
});

test("Cancelled reservation should not block the same time slot", async () => {
  const firstUser =
    await createUserAndLogin("user1@example.com");

  const secondUser =
    await createUserAndLogin("user2@example.com");

  const resource = await createResource();

  const firstReservation = await request(app)
    .post("/api/reservations")
    .set(
      "Authorization",
      `Bearer ${firstUser.token}`
    )
    .send({
      resourceId: resource.id,
      startDate: "2030-10-05T10:00:00.000Z",
      endDate: "2030-10-05T12:00:00.000Z"
    });

  expect(firstReservation.statusCode).toBe(201);

  const cancelResponse = await request(app)
    .patch(
      `/api/reservations/${firstReservation.body.id}/cancel`
    )
    .set(
      "Authorization",
      `Bearer ${firstUser.token}`
    );

  expect(cancelResponse.statusCode).toBe(200);

  const secondReservation = await request(app)
    .post("/api/reservations")
    .set(
      "Authorization",
      `Bearer ${secondUser.token}`
    )
    .send({
      resourceId: resource.id,
      startDate: "2030-10-05T10:00:00.000Z",
      endDate: "2030-10-05T12:00:00.000Z"
    });

  expect(secondReservation.statusCode).toBe(201);
});

test("ADMIN should access another user's reservation", async () => {
  const normalUser =
    await createUserAndLogin("user1@example.com");

  const admin =
    await createUserAndLogin("admin@example.com");

  await prisma.user.update({
    where: {
      id: admin.user.id
    },
    data: {
      role: "ADMIN"
    }
  });

  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: "admin@example.com",
      password: "123456"
    });

  const adminToken =
    adminLogin.body.token;

  const resource = await createResource();

  const reservationResponse = await request(app)
    .post("/api/reservations")
    .set(
      "Authorization",
      `Bearer ${normalUser.token}`
    )
    .send({
      resourceId: resource.id,
      startDate: "2030-10-05T10:00:00.000Z",
      endDate: "2030-10-05T12:00:00.000Z"
    });

  expect(reservationResponse.statusCode).toBe(201);

  const response = await request(app)
    .get(
      `/api/reservations/${reservationResponse.body.id}`
    )
    .set(
      "Authorization",
      `Bearer ${adminToken}`
    );

  expect(response.statusCode).toBe(200);

  expect(response.body.id).toBe(
    reservationResponse.body.id
  );
});

test("ADMIN should update another user's reservation", async () => {
  const normalUser =
    await createUserAndLogin("user1@example.com");

  const admin =
    await createUserAndLogin("admin@example.com");

  await prisma.user.update({
    where: {
      id: admin.user.id
    },
    data: {
      role: "ADMIN"
    }
  });

  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: "admin@example.com",
      password: "123456"
    });

  const adminToken =
    adminLogin.body.token;

  const resource = await createResource();

  const reservationResponse = await request(app)
    .post("/api/reservations")
    .set(
      "Authorization",
      `Bearer ${normalUser.token}`
    )
    .send({
      resourceId: resource.id,
      startDate: "2030-10-05T10:00:00.000Z",
      endDate: "2030-10-05T12:00:00.000Z"
    });

  const response = await request(app)
    .put(
      `/api/reservations/${reservationResponse.body.id}`
    )
    .set(
      "Authorization",
      `Bearer ${adminToken}`
    )
    .send({
      startDate: "2030-10-05T13:00:00.000Z",
      endDate: "2030-10-05T15:00:00.000Z"
    });

  expect(response.statusCode).toBe(200);

  expect(response.body.startDate).toBe(
    "2030-10-05T13:00:00.000Z"
  );
});

test("ADMIN should cancel another user's reservation", async () => {
  const normalUser =
    await createUserAndLogin("user1@example.com");

  const admin =
    await createUserAndLogin("admin@example.com");

  await prisma.user.update({
    where: {
      id: admin.user.id
    },
    data: {
      role: "ADMIN"
    }
  });

  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: "admin@example.com",
      password: "123456"
    });

  const adminToken =
    adminLogin.body.token;

  const resource = await createResource();

  const reservationResponse = await request(app)
    .post("/api/reservations")
    .set(
      "Authorization",
      `Bearer ${normalUser.token}`
    )
    .send({
      resourceId: resource.id,
      startDate: "2030-10-05T10:00:00.000Z",
      endDate: "2030-10-05T12:00:00.000Z"
    });

  const response = await request(app)
    .patch(
      `/api/reservations/${reservationResponse.body.id}/cancel`
    )
    .set(
      "Authorization",
      `Bearer ${adminToken}`
    );

  expect(response.statusCode).toBe(200);
  expect(response.body.status).toBe("CANCELLED");
});

test("Reservation endpoint should return 401 without token", async () => {
  const response = await request(app)
    .get("/api/reservations");

  expect(response.statusCode).toBe(401);
});

test("Reservation endpoint should return 401 with invalid token", async () => {
  const response = await request(app)
    .get("/api/reservations")
    .set(
      "Authorization",
      "Bearer definitely-not-a-valid-jwt"
    );

  expect(response.statusCode).toBe(401);
});

test("Updating non-existing reservation should return 404", async () => {
  const { token } =
    await createUserAndLogin("user1@example.com");

  const response = await request(app)
    .put("/api/reservations/999999")
    .set("Authorization", `Bearer ${token}`)
    .send({
      startDate: "2030-10-05T10:00:00.000Z",
      endDate: "2030-10-05T12:00:00.000Z"
    });

  expect(response.statusCode).toBe(404);
  expect(response.body.message).toBe(
    "Reservation not found"
  );
});

test("Cancelling non-existing reservation should return 404", async () => {
  const { token } =
    await createUserAndLogin("user1@example.com");

  const response = await request(app)
    .patch("/api/reservations/999999/cancel")
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(404);
  expect(response.body.message).toBe(
    "Reservation not found"
  );
});

test("Updating reservation with its own time slot should not conflict with itself", async () => {
  const { token } =
    await createUserAndLogin("user1@example.com");

  const resource = await createResource();

  const createResponse = await request(app)
    .post("/api/reservations")
    .set("Authorization", `Bearer ${token}`)
    .send({
      resourceId: resource.id,
      startDate: "2030-10-05T10:00:00.000Z",
      endDate: "2030-10-05T12:00:00.000Z"
    });

  expect(createResponse.statusCode).toBe(201);

  const response = await request(app)
    .put(
      `/api/reservations/${createResponse.body.id}`
    )
    .set("Authorization", `Bearer ${token}`)
    .send({
      startDate: "2030-10-05T10:00:00.000Z",
      endDate: "2030-10-05T12:00:00.000Z"
    });

  expect(response.statusCode).toBe(200);
});

test("Reservations should support status filtering and pagination", async () => {
  const { user, token } =
    await createUserAndLogin("user1@example.com");

  const firstResource = await createResource({
    name: "Room A"
  });

  const secondResource = await createResource({
    name: "Room B"
  });

  const thirdResource = await createResource({
    name: "Room C"
  });

  await prisma.reservation.create({
    data: {
      userId: user.id,
      resourceId: firstResource.id,
      startDate: new Date("2030-10-05T10:00:00.000Z"),
      endDate: new Date("2030-10-05T11:00:00.000Z"),
      status: "ACTIVE"
    }
  });

  await prisma.reservation.create({
    data: {
      userId: user.id,
      resourceId: secondResource.id,
      startDate: new Date("2030-10-05T12:00:00.000Z"),
      endDate: new Date("2030-10-05T13:00:00.000Z"),
      status: "ACTIVE"
    }
  });

  await prisma.reservation.create({
    data: {
      userId: user.id,
      resourceId: thirdResource.id,
      startDate: new Date("2030-10-05T14:00:00.000Z"),
      endDate: new Date("2030-10-05T15:00:00.000Z"),
      status: "CANCELLED"
    }
  });

  const response = await request(app)
    .get(
      "/api/reservations?status=ACTIVE&page=1&limit=1"
    )
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);

  expect(response.body.data).toHaveLength(1);

  expect(response.body.pagination.page).toBe(1);
  expect(response.body.pagination.limit).toBe(1);
  expect(response.body.pagination.total).toBe(2);
  expect(response.body.pagination.totalPages).toBe(2);

  expect(response.body.data[0].status).toBe(
    "ACTIVE"
  );
});

test("Updating reservation to inactive resource should return 409", async () => {
  const { token } =
    await createUserAndLogin("user1@example.com");

  const activeResource =
    await createResource({
      name: "Active Room"
    });

  const inactiveResource =
    await createResource({
      name: "Inactive Room",
      isActive: false
    });

  const createResponse = await request(app)
    .post("/api/reservations")
    .set("Authorization", `Bearer ${token}`)
    .send({
      resourceId: activeResource.id,
      startDate: "2030-10-05T10:00:00.000Z",
      endDate: "2030-10-05T12:00:00.000Z"
    });

  expect(createResponse.statusCode).toBe(201);

  const response = await request(app)
    .put(
      `/api/reservations/${createResponse.body.id}`
    )
    .set("Authorization", `Bearer ${token}`)
    .send({
      resourceId: inactiveResource.id
    });

  expect(response.statusCode).toBe(409);
  expect(response.body.message).toBe(
    "Resource is inactive"
  );
});
});