import {PrismaClient} from "@prisma/client";
import XLSX from "xlsx";
import * as path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

const FILE_PATH = path.join(__dirname, "../data/final-shortlisted-teams.xlsx");

interface Member {
  name: string;
  email: string;
  phone: string;
}

interface ParsedTeam {
  name: string;
  residence: "inhouse" | "outhouse";
  leader: Member;
  members: Member[];
}

function str(v: unknown): string {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function isValidMemberName(name: string): boolean {
  return Boolean(name) && name.toLowerCase() !== "null" && !/^member\s*\d*$/i.test(name);
}

function extractLeader(row: Record<string, any>): Member | null {
  // These top-level fields (asked before the MUJ/non-MUJ branch) are
  // consistently correct in both the Inhouse and Outhouse tabs.
  const name = str(row["Team Leader Name"]);
  if (!isValidMemberName(name)) return null;
  return {
    name,
    phone: str(row["Team Leader Contact Number"]),
    email: str(row["Team Leader E-mail"]),
  };
}

// The "Inhouse" tab's per-member header row is mislabeled: every column from
// "Registration Number" onward actually holds the value of the NEXT real
// field (e.g. the "Contact Number" column holds the personal email, and
// "Registration Number" holds the actual phone number). Verified by
// cross-checking against the "Form Responses 1" sheet for the same rows.
function extractMembersInhouse(row: Record<string, any>): Member[] {
  const members: Member[] = [];
  for (let i = 2; i <= 4; i++) {
    const name = str(row[`Member ${i} Name`]);
    const phone = str(row[`Member ${i} Registration Number`]);
    const email = str(row[`Member ${i} Contact Number`]) || str(row[`Member ${i} Email (Personal)`]);
    if (isValidMemberName(name) || phone || email) {
      members.push({name: isValidMemberName(name) ? name : `Member ${i}`, phone, email});
    }
  }
  return members;
}

function extractMembersOuthouse(row: Record<string, any>): Member[] {
  const members: Member[] = [];
  for (let i = 2; i <= 4; i++) {
    const name = str(row[`Member ${i} Name`]);
    const phone = str(row[`Member ${i} Contact Number`]);
    const email = str(row[`Member ${i} Email (Personal)`]) || str(row[`Member ${i} Email (College official email)`]);
    if (isValidMemberName(name) || phone || email) {
      members.push({name: isValidMemberName(name) ? name : `Member ${i}`, phone, email});
    }
  }
  return members;
}

function parseSheet(
  workbook: XLSX.WorkBook,
  sheetName: string,
  residence: "inhouse" | "outhouse",
): ParsedTeam[] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found in workbook`);
  const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {defval: ""});

  const teams: ParsedTeam[] = [];
  for (const row of rows) {
    const name = str(row["Team Name"]);
    if (!name) continue;

    const leader = extractLeader(row);
    if (!leader) continue;

    const members = residence === "inhouse" ? extractMembersInhouse(row) : extractMembersOuthouse(row);
    teams.push({name, residence, leader, members});
  }
  return teams;
}

function loadTeams(): ParsedTeam[] {
  const workbook = XLSX.readFile(FILE_PATH);
  const inhouse = parseSheet(workbook, "Inhouse", "inhouse");
  const outhouse = parseSheet(workbook, "Outhouse", "outhouse");
  return [...inhouse, ...outhouse];
}

async function wipeOldTeamData() {
  console.log("🧹 Removing existing team data...");
  await prisma.pSBookmark.deleteMany({where: {user: {role: "TEAM"}}});
  await prisma.mentorshipQueue.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.teamScore.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.teamCheckpoint.deleteMany();
  await prisma.user.deleteMany({where: {role: "TEAM"}});
  await prisma.team.deleteMany(); // cascades to TeamParticipant
  await prisma.round1Room.updateMany({data: {filled: 0}});
  console.log("✅ Old team data removed");
}

async function importTeams(teams: ParsedTeam[]) {
  let counter = 1;
  for (const team of teams) {
    const teamId = `TEAM${counter.toString().padStart(3, "0")}`;
    await prisma.team.create({
      data: {
        name: team.name,
        teamId,
        status: "REGISTERED",
        participants: {
          create: [
            {
              name: team.leader.name,
              email: team.leader.email,
              phone: team.leader.phone,
              role: "LEADER",
              residence: team.residence,
              verified: false,
            },
            ...team.members.map((m) => ({
              name: m.name,
              email: m.email,
              phone: m.phone,
              role: "MEMBER" as const,
              residence: team.residence,
              verified: false,
            })),
          ],
        },
      },
    });
    console.log(`✅ ${teamId} — ${team.name} (${team.residence}, ${team.members.length + 1} members)`);
    counter++;
  }
}

async function main() {
  const commit = process.argv.includes("--commit");
  const teams = loadTeams();

  console.log(`Parsed ${teams.length} teams total.`);
  const inhouseCount = teams.filter((t) => t.residence === "inhouse").length;
  const outhouseCount = teams.filter((t) => t.residence === "outhouse").length;
  console.log(`  Inhouse: ${inhouseCount}, Outhouse: ${outhouseCount}`);

  console.log("\nSample (first 2 inhouse, first 2 outhouse):");
  for (const t of teams.filter((t) => t.residence === "inhouse").slice(0, 2)) {
    console.log(JSON.stringify(t, null, 2));
  }
  for (const t of teams.filter((t) => t.residence === "outhouse").slice(0, 2)) {
    console.log(JSON.stringify(t, null, 2));
  }

  if (!commit) {
    console.log(
      "\n💡 Dry run only — no changes made. Re-run with --commit to wipe old team data and import these teams.",
    );
    return;
  }

  await wipeOldTeamData();
  await importTeams(teams);
  console.log(`\n🎉 Imported ${teams.length} teams.`);
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
