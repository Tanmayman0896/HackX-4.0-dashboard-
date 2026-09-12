// One-off fix: Round 2 room assignments (judge.round2RoomId / team.round2RoomId) were
// previously made without creating Evaluation rows, so judges could never submit Round 2
// scores. Run once after deploying the assignJudgeToRoom/assignTeamToRoom fix:
//   tsx scripts/backfill-round2-evaluations.ts
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env" });

const prisma = new PrismaClient();

async function main() {
  const rooms = await prisma.round2Room.findMany({
    include: {
      teams: { select: { id: true } },
      judges: { select: { id: true } },
    },
  });

  let created = 0;

  for (const room of rooms) {
    if (room.teams.length === 0 || room.judges.length === 0) continue;

    const data = room.judges.flatMap((judge) =>
      room.teams.map((team) => ({
        teamId: team.id,
        judgeId: judge.id,
        round: 2,
      })),
    );

    const result = await prisma.evaluation.createMany({
      data,
      skipDuplicates: true,
    });
    created += result.count;
    console.log(`✅ Room ${room.name}: ensured ${data.length} evaluations (${result.count} new)`);
  }

  console.log(`Done. Created ${created} missing Round 2 evaluation(s).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error backfilling round 2 evaluations:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
