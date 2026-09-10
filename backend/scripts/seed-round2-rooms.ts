// Creates Round2Room rows. Edit ROOMS below, then run: tsx scripts/seed-round2-rooms.ts
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env" });

const prisma = new PrismaClient();

const BLOCK = "LHC";
const CAPACITY = 11;

const ROOMS = [
  "215", "216", "218", "219", "220",
  "201", "202", "203", "204", "205", "206", "207", "208",
  "212", "213",
];

async function main() {
  const removed = await prisma.round2Room.deleteMany({
    where: { name: { notIn: ROOMS } },
  });
  console.log(`🗑️  Removed ${removed.count} old room(s)`);

  console.log(`🏠 Creating ${ROOMS.length} Round2Rooms (block ${BLOCK})...`);

  for (const name of ROOMS) {
    await prisma.round2Room.upsert({
      where: { name },
      update: { block: BLOCK, capacity: CAPACITY },
      create: { name, block: BLOCK, capacity: CAPACITY },
    });
    console.log(`✅ Room ${BLOCK}-${name} (capacity ${CAPACITY})`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding round 2 rooms:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
