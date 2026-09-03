import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";
import { cleanDatabase } from "./test-utils.js";

describe("Auth API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("POST /api/auth/register should create a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Test User",
        email: "test@example.com",
        password: "123456"
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.email).toBe("test@example.com");
    expect(response.body.role).toBe("USER");
    expect(response.body.passwordHash).toBeUndefined();
  });

  test("POST /api/auth/login should return token for valid credentials", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Test User",
        email: "test@example.com",
        password: "123456"
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "123456"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe("test@example.com");
  });

  test("POST /api/auth/login should return 401 for invalid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "wrong@example.com",
        password: "wrongpassword"
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      message: "Invalid email or password"
    });
  });
});