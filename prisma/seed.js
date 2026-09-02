import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({adapter});

async function main() {
    await prisma.resource.createMany({
        data:[
             {
        name: "Meeting Room A",
        description: "Small meeting room for team meetings",
        capacity: 6,
        location: "Floor 1",
        isActive: true
      },
      {
        name: "Conference Room",
        description: "Large conference room for presentations",
        capacity: 20,
        location: "Floor 2",
        isActive: true
      },
      {
        name: "Study Room 1",
        description: "Quiet study room",
        capacity: 4,
        location: "Floor 3",
        isActive: true
      }
        ],
        skipDuplicates: true
    });

    const testUser = await prisma.user.upsert({
      where: {
        email: "test@example.com"
      },
      update: {},
      create: {
        fullName: "Test User",
        email: "test@example.com",
        passwordHash: "temporary-hash",
        role: "USER"
      }
    });
    console.log(`Test user id: ${testUser.id}`);
    console.log("Seed Completed");

}


main().catch((error) => {
    console.error("Seed Failed:", error);
    process.exit(1);
}).finally(async () => { await prisma.$disconnect}); 