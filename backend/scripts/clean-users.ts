import { PrismaClient } from "@prisma/client";
import { seedAdmins, seedSuperAdmins, seedTeams } from "./seed";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🧹 Cleaning SuperAdmin, Admin, and Team users & data...");

    // Delete legacy and existing SuperAdmin, Admin, and Team user accounts
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        OR: [
          { role: { in: ["SUPER_ADMIN", "ADMIN", "TEAM"] } },
          { username: { in: ["superadmin", "admin", "TEAM001"] } },
        ],
      },
    });
    console.log(`🗑️ Deleted ${deletedUsers.count} SuperAdmin/Admin/Team user rows.`);

    // Re-seed clean standard accounts: 15 Admins, 5 SuperAdmins, 20 Teams
    console.log("🌱 Re-seeding clean standard accounts...");
    await seedAdmins();
    await seedSuperAdmins();
    await seedTeams(20);

    console.log("🎉 Database cleaned and re-seeded successfully!");
  } catch (error) {
    console.error("❌ Cleaning failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
