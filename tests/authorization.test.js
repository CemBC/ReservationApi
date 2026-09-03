import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";
import { cleanDatabase } from "./test-utils.js";

describe("Authorization", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function registerAndLogin(email) {
    await request(app)
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

    return loginResponse.body;
  }

  test("USER should receive 403 when creating a resource", async () => {
    const { token } = await registerAndLogin("user@example.com");

    const response = await request(app)
      .post("/api/resources")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Meeting Room",
        description: "Test room",
        capacity: 6,
        location: "Floor 1",
        isActive: true
      });

    expect(response.statusCode).toBe(403);
  });

  test("ADMIN should be able to create a resource", async () => {
    const { user } = await registerAndLogin("admin@example.com");

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        role: "ADMIN"
      }
    });

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "123456"
      });

    const token = loginResponse.body.token;

    const response = await request(app)
      .post("/api/resources")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Meeting Room",
        description: "Test room",
        capacity: 6,
        location: "Floor 1",
        isActive: true
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe("Meeting Room");
  });

  test("Protected endpoint should return 401 without token", async () => {
    const response = await request(app)
      .get("/api/resources");

    expect(response.statusCode).toBe(401);
  });
});