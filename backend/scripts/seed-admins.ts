import { PrismaClient } from "@prisma/client";
import { seedAdmins, seedSuperAdmins } from "./seed";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🚀 Starting admin and superadmin seeding...");
    await seedAdmins(15);
    await seedSuperAdmins(5);
    console.log("🎉 Admin seeding completed successfully!");
  } catch (error) {
    console.error("❌ Admin seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
