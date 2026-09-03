import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";
import { cleanDatabase } from "./test-utils.js";

describe("Resource API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function createAdminAndLogin() {
    await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Admin User",
        email: "admin@example.com",
        password: "123456"
      });

    const user = await prisma.user.findUnique({
      where: {
        email: "admin@example.com"
      }
    });

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

    return loginResponse.body.token;
  }

  test("ADMIN should create a resource", async () => {
    const token = await createAdminAndLogin();

    const response = await request(app)
      .post("/api/resources")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Conference Room",
        description: "Large conference room",
        capacity: 12,
        location: "Floor 2",
        isActive: true
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe("Conference Room");
    expect(response.body.capacity).toBe(12);
  });

  test("Authenticated user should list resources", async () => {
    const token = await createAdminAndLogin();

    await prisma.resource.createMany({
      data: [
        {
          name: "Room A",
          capacity: 5,
          location: "Floor 1",
          isActive: true
        },
        {
          name: "Room B",
          capacity: 10,
          location: "Floor 2",
          isActive: true
        }
      ]
    });

    const response = await request(app)
      .get("/api/resources")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.pagination.total).toBe(2);
  });

  test("Resource filtering by location should work", async () => {
    const token = await createAdminAndLogin();

    await prisma.resource.createMany({
      data: [
        {
          name: "Room A",
          capacity: 5,
          location: "Floor 1",
          isActive: true
        },
        {
          name: "Room B",
          capacity: 10,
          location: "Floor 2",
          isActive: true
        }
      ]
    });

    const response = await request(app)
      .get("/api/resources?location=Floor 1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].location).toBe("Floor 1");
  });

  test("ADMIN should update a resource", async () => {
    const token = await createAdminAndLogin();

    const resource = await prisma.resource.create({
      data: {
        name: "Old Room",
        capacity: 5,
        location: "Floor 1",
        isActive: true
      }
    });

    const response = await request(app)
      .put(`/api/resources/${resource.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Room"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe("Updated Room");
  });

  test("ADMIN should delete a resource", async () => {
    const token = await createAdminAndLogin();

    const resource = await prisma.resource.create({
      data: {
        name: "Temporary Room",
        capacity: 4,
        location: "Floor 3",
        isActive: true
      }
    });

    const response = await request(app)
      .delete(`/api/resources/${resource.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(204);

    const deletedResource = await prisma.resource.findUnique({
      where: {
        id: resource.id
      }
    });

    expect(deletedResource).toBeNull();
  });
});