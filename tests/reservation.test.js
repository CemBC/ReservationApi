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

  async function createResource() {
    return await prisma.resource.create({
      data: {
        name: "Meeting Room A",
        description: "Test meeting room",
        capacity: 6,
        location: "Floor 1",
        isActive: true
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
});