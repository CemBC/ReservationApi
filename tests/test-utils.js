import prisma from "../src/config/prisma.js";

export async function cleanDatabase() {
  await prisma.reservation.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();
}