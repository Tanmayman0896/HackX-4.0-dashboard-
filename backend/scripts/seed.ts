import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../utils/password";
import { createBasicData, createRooms } from "./import-shortlisted";
import * as path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

export async function seedTeams(count = 20) {
  console.log(`🌱 Seeding ${count} teams (TEAM001 to TEAM${count.toString().padStart(3, "0")})...`);
  const createdTeams = [];

  for (let i = 1; i <= count; i++) {
    const teamId = `TEAM${i.toString().padStart(3, "0")}`;
    const name = `Team ${i.toString().padStart(3, "0")}`;

    const team = await prisma.team.upsert({
      where: { teamId },
      update: {},
      create: {
        teamId,
        name,
        status: "REGISTERED",
        submissionStatus: "NOT_SUBMITTED",
      },
    });

    createdTeams.push(team);
  }

  console.log(`✅ Successfully seeded/verified ${createdTeams.length} teams`);
  return createdTeams;
}

export async function seedAdmins(count = 15) {
  console.log(`🌱 Seeding ${count} admin users (admin01 to admin${count.toString().padStart(2, "0")})...`);
  const defaultPasswordHash = await hashPassword("admin123");
  const admins = [];

  for (let i = 1; i <= count; i++) {
    const username = `admin${i.toString().padStart(2, "0")}`;
    const email = `${username}@hackathon.com`;

    const user = await prisma.user.upsert({
      where: { username },
      update: {
        role: "ADMIN",
        status: "ACTIVE",
      },
      create: {
        username,
        password: defaultPasswordHash,
        email,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    admins.push(user);
  }

  console.log(`✅ Successfully seeded/verified ${admins.length} admin users`);
  return admins;
}

export async function seedSuperAdmins(count = 5) {
  console.log(`🌱 Seeding ${count} superadmin users (superadmin01 to superadmin${count.toString().padStart(2, "0")})...`);
  const defaultPasswordHash = await hashPassword("admin123");
  const superAdmins = [];

  for (let i = 1; i <= count; i++) {
    const username = `superadmin${i.toString().padStart(2, "0")}`;
    const email = `${username}@hackathon.com`;

    const user = await prisma.user.upsert({
      where: { username },
      update: {
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
      create: {
        username,
        password: defaultPasswordHash,
        email,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });

    superAdmins.push(user);
  }

  console.log(`✅ Successfully seeded/verified ${superAdmins.length} superadmin users`);
  return superAdmins;
}

export async function seedAdminsAndSuperAdmins() {
  const admins = await seedAdmins(15);
  const superAdmins = await seedSuperAdmins(5);
  return { admins, superAdmins };
}

export async function seedAll() {
  console.log("🚀 Starting idempotent database seed process...");

  // 1. Foundational data (domains, problem statements, rooms, default users, settings)
  await createBasicData();
  await createRooms();

  // 2. 20 Teams (TEAM001 - TEAM020)
  await seedTeams(20);

  // 3. 15 Admins (admin01 - admin15)
  await seedAdmins(15);

  // 4. 5 Super Admins (superadmin01 - superadmin05)
  await seedSuperAdmins(5);

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📋 Seeded Summary:");
  console.log("• Teams: TEAM001 through TEAM020 (Status: REGISTERED)");
  console.log("• Admins: admin01 through admin15 (Role: ADMIN, Status: ACTIVE, Password: admin123)");
  console.log("• Super Admins: superadmin01 through superadmin05 (Role: SUPER_ADMIN, Status: ACTIVE, Password: admin123)");
}

async function main() {
  try {
    await seedAll();
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const isDirectRun = Boolean(
  process.argv[1] && (
    fileURLToPath(import.meta.url) === path.resolve(process.argv[1]) ||
    process.argv[1].endsWith("seed.ts")
  )
);

if (isDirectRun) {
  main();
}
