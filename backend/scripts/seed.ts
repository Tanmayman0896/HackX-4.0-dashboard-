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

const CUSTOM_SUPER_ADMINS = [
  { username: "Tanmay", hash: "$2a$12$YYKrARPcJ34h5TNOTpn2POYns6RGvaj4Bzd2CaeV2qjMZZsyg9O8K" },
  { username: "Aryan", hash: "$2a$12$bb9ggqrb/V97soxyNcLoQO80uVGWViqkER/H0pICyfrXMg1z0TsvG" },
  { username: "Dolly", hash: "$2a$12$Rt0LAjo/Ed3GpOVIcdAJ.eCQ1EQxj.LZmbyu6Civtb/JgV0Tx5hRa" },
  { username: "Vidhyanshu", hash: "$2a$12$0h1YK7w6ZwaXDGoBW3djLuxQtQNrTbpQxopSch7zc8uV7YWTNbMrq" },
];

const CUSTOM_ADMINS = [
  { username: "Tanmay-Admin", hash: "$2a$12$AVLC/ezobXg9UMejGtAIsewbhGfAtyXHYpjCobk5fJ0NYCKQ0ll8O" },
  { username: "Dolly-Admin", hash: "$2a$12$Shj1gh2Txqnfcg7.UiAQPePh7G7fcxZi23FS6somZlyIarrOT0xhe" },
  { username: "Srijan", hash: "$2a$12$UGBveL499ivca3Ck4/ndCu8nf79SdJR7LHi64eb4QWHBxazvOQ/8G" },
  { username: "Pushkar", hash: "$2a$12$DDW8VngrVXKf9VW0H2bABu3sHGd2nBvvfDCgbkEHF4WeahlbZ6mUC" },
  { username: "Arindam", hash: "$2a$12$Cf9KbnUWte3tLlBBdFqXyeyF/9Mz0yyFvfvbPACZ.mty0D11fQWH." },
  { username: "Anshuman", hash: "$2a$12$yiaBGtF1mvVnmcfF4TmxPOqlf0PmfNgtP3BlBb5s50Qi7MX5XYASm" },
  { username: "Aarush-Chandra", hash: "$2a$12$wLlO/CoPRcn3kTU.Skw37.34IK6HL6LA7Lj9lnX1rOwLvju9qOiLy" },
  { username: "Aarush-Dayal", hash: "$2a$12$E/YMRL6HIhvcQnfyI4CYiuVEBE.Jl.s60B.6cu20ugM8DMlNfDcBO" },
  { username: "Abhishek", hash: "$2a$12$I7GouMpS5hZr/Kh1KUt/XeB1Yr1DJtSpPUm86E3pyPhhfX/7IytzS" },
  { username: "Ayush", hash: "$2a$12$lcEH.l4vldZhDtzS55Y.1.FPLBki1lvq6Alv7BRJF7kH6QvFNju7C" },
  { username: "Dev", hash: "$2a$12$a5M6R/wN1hnjx.x8nCs3ZuYiGmKzpJx7yDdR/T.zDPRDTdNnQHnZO" },
  { username: "Harsh", hash: "$2a$12$cVLe6LagYv7vpPh8UQx7.ek83FNwUkHscTEz8VRUOXQtGWaVa/iuq" },
  { username: "Saksham", hash: "$2a$12$4MjjIOBKAqQNdZR4CrnTHe6qHUseWS2BzZzmOKqZxE4dEqmfIdSfW" },
  { username: "Admin01", hash: "$2a$12$i5ceZ0V1Aorxh0DqJvyehe23eN9ZYJVsZlVttDxA4JVY7L/WxkIRG" },
  { username: "Admin02", hash: "$2a$12$Ze0WUTicy.xUYgBl2XrH0.dqHdxKA9ZvGQ0pcesyjG/VXSN4ARkhC" },
];

export async function seedAdmins() {
  console.log(`🌱 Seeding ${CUSTOM_ADMINS.length} admin users...`);
  const admins = [];

  for (const item of CUSTOM_ADMINS) {
    const email = `${item.username.toLowerCase()}@hackathon.com`;

    const user = await prisma.user.upsert({
      where: { username: item.username },
      update: {
        password: item.hash,
        role: "ADMIN",
        status: "ACTIVE",
      },
      create: {
        username: item.username,
        password: item.hash,
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

export async function seedSuperAdmins() {
  console.log(`🌱 Seeding ${CUSTOM_SUPER_ADMINS.length} superadmin users...`);
  const superAdmins = [];

  for (const item of CUSTOM_SUPER_ADMINS) {
    const email = `${item.username.toLowerCase()}@hackathon.com`;

    const user = await prisma.user.upsert({
      where: { username: item.username },
      update: {
        password: item.hash,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
      create: {
        username: item.username,
        password: item.hash,
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
  const admins = await seedAdmins();
  const superAdmins = await seedSuperAdmins();
  return { admins, superAdmins };
}

export async function seedAll() {
  console.log("🚀 Starting idempotent database seed process...");

  // 1. Foundational data (domains, problem statements, rooms, default users, settings)
  await createBasicData();
  await createRooms();

  // 2. 20 Teams (TEAM001 - TEAM020)
  await seedTeams(20);

  // 3. Custom Admins
  await seedAdmins();

  // 4. Custom Super Admins
  await seedSuperAdmins();

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
