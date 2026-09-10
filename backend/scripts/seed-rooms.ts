// Creates Round1Room rows (needed before checkpoint 2 can assign a room to a team).
// Edit ROOMS below, then run: tsx scripts/seed-rooms.ts
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env" });

const prisma = new PrismaClient();

const BLOCK = "LHC";
const DEFAULT_CAPACITY = 11;
const HIGH_CAPACITY_ROOMS = new Set(["201", "202", "203", "204", "205", "206", "207", "208"]);
const HIGH_CAPACITY = 11;

const ROOMS = [
  "215", "216", "218", "219", "220",
  "201", "202", "203", "204", "205", "206", "207", "208",
  "212", "213",
];

async function main() {
  const removed = await prisma.round1Room.deleteMany({
    where: { name: { notIn: ROOMS } },
  });
  console.log(`🗑️  Removed ${removed.count} old room(s)`);

  console.log(`🏠 Creating ${ROOMS.length} Round1Rooms (block ${BLOCK})...`);

  for (const name of ROOMS) {
    const capacity = HIGH_CAPACITY_ROOMS.has(name) ? HIGH_CAPACITY : DEFAULT_CAPACITY;
    await prisma.round1Room.upsert({
      where: { name },
      update: { block: BLOCK, capacity },
      create: { name, block: BLOCK, capacity },
    });
    console.log(`✅ Room ${BLOCK}-${name} (capacity ${capacity})`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding rooms:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
