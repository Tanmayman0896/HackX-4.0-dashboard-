import { describe, it, expect, beforeEach } from "vitest";
import { mockPrisma, resetPrismaMocks } from "./helpers/mockPrisma";
import { superAdminService } from "../services/superAdminService";
import { judgeService } from "../services/judgeService";
import { teamService } from "../services/teamService";

interface DbState {
  users: any[];
  teams: any[];
  teamParticipants: any[];
  problemStatements: any[];
  submissions: any[];
  checkpoints: any[];
  evaluations: any[];
  teamScores: any[];
  judges: any[];
  round1Rooms: any[];
  round2Rooms: any[];
  round3Rooms: any[];
  systemSettings: any[];
}

describe("End-to-End Tournament Lifecycle: Rounds 1, 2, and 3", () => {
  let db: DbState;

  beforeEach(() => {
    resetPrismaMocks();

    // Initialize in-memory database state
    db = {
      users: [],
      teams: [],
      teamParticipants: [],
      problemStatements: [
        { id: "ps-ai", title: "Autonomous Disaster Response", domainId: "dom-1" },
        { id: "ps-web3", title: "Decentralized Identity Verification", domainId: "dom-2" },
      ],
      submissions: [],
      checkpoints: [],
      evaluations: [],
      teamScores: [],
      judges: [],
      round1Rooms: [{ id: "r1-1", name: "001", block: "AB1", capacity: 10, filled: 0 }],
      round2Rooms: [],
      round3Rooms: [],
      systemSettings: [
        { key: "problem_statements_locked", value: "false" },
        { key: "round1_locked", value: "false" },
      ],
    };

    // Wire up Prisma mocks to operate on our in-memory database state
    mockPrisma.user.findUnique.mockImplementation(async ({ where }: any) => {
      const user = db.users.find(
        (u) => (where.id && u.id === where.id) || (where.username && u.username === where.username),
      );
      if (!user) return null;
      const team = db.teams.find((t) => t.id === user.teamId || t.teamId === user.username);
      return { ...user, participantTeam: team ? { ...team } : null };
    });

    mockPrisma.user.create.mockImplementation(async ({ data }: any) => {
      const newUser = { id: `u-${Date.now()}-${Math.random()}`, ...data };
      db.users.push(newUser);
      return newUser;
    });

    mockPrisma.team.findUnique.mockImplementation(async ({ where }: any) => {
      const team = db.teams.find((t) => (where.id && t.id === where.id) || (where.teamId && t.teamId === where.teamId));
      if (!team) return null;
      const participants = db.teamParticipants.filter((p) => p.teamId === team.id);
      const teamCheckpoints = db.checkpoints.filter((c) => c.teamId === team.id);
      return { ...team, participants, checkpoints: teamCheckpoints };
    });

    mockPrisma.team.findMany.mockImplementation(async ({ where }: any = {}) => {
      let result = [...db.teams];
      if (where?.status?.in) {
        result = result.filter((t) => where.status.in.includes(t.status));
      }
      if (where?.round3RoomId?.not === null) {
        result = result.filter((t) => t.round3RoomId !== null);
      }
      if (where?.round3RoomId && typeof where.round3RoomId === "string") {
        result = result.filter((t) => t.round3RoomId === where.round3RoomId);
      }
      return result.map((t) => {
        const room = db.round3Rooms.find((r) => r.id === t.round3RoomId);
        return { ...t, round3Room: room ? { id: room.id, name: room.name } : null };
      });
    });

    mockPrisma.team.count.mockImplementation(async ({ where }: any = {}) => {
      let count = db.teams.length;
      if (where?.round3RoomId?.not === null) {
        count = db.teams.filter((t) => t.round3RoomId !== null && t.round3RoomId !== undefined).length;
      }
      return count;
    });

    mockPrisma.team.update.mockImplementation(async ({ where, data }: any) => {
      const index = db.teams.findIndex((t) => t.id === where.id);
      if (index === -1) throw new Error("Team not found");
      db.teams[index] = { ...db.teams[index], ...data };
      const room = db.round1Rooms.find((r) => r.name === "001");
      return { ...db.teams[index], round1Room: room };
    });

    mockPrisma.team.updateMany.mockImplementation(async ({ where, data }: any) => {
      let updatedCount = 0;
      db.teams = db.teams.map((t) => {
        if (!where?.id?.in || where.id.in.includes(t.id)) {
          updatedCount++;
          return { ...t, ...data };
        }
        return t;
      });
      return { count: updatedCount };
    });

    mockPrisma.teamParticipant.deleteMany.mockImplementation(async ({ where }: any) => {
      const before = db.teamParticipants.length;
      db.teamParticipants = db.teamParticipants.filter((p) => p.teamId !== where.teamId);
      return { count: before - db.teamParticipants.length };
    });

    mockPrisma.teamParticipant.create.mockImplementation(async ({ data }: any) => {
      const newPart = { id: `tp-${Date.now()}-${Math.random()}`, ...data };
      db.teamParticipants.push(newPart);
      return newPart;
    });

    mockPrisma.teamCheckpoint.findUnique.mockImplementation(async ({ where }: any) => {
      const { teamId, checkpoint } = where.teamId_checkpoint;
      return db.checkpoints.find((c) => c.teamId === teamId && c.checkpoint === checkpoint) || null;
    });

    mockPrisma.teamCheckpoint.upsert.mockImplementation(async ({ where, create, update }: any) => {
      const { teamId, checkpoint } = where.teamId_checkpoint;
      const index = db.checkpoints.findIndex((c) => c.teamId === teamId && c.checkpoint === checkpoint);
      if (index > -1) {
        db.checkpoints[index] = { ...db.checkpoints[index], ...update, teamId, checkpoint };
        return db.checkpoints[index];
      } else {
        const newCp = { id: `cp-${Date.now()}`, ...create, teamId, checkpoint };
        db.checkpoints.push(newCp);
        return newCp;
      }
    });

    mockPrisma.systemSettings.findUnique.mockImplementation(async ({ where }: any) => {
      return db.systemSettings.find((s) => s.key === where.key) || null;
    });

    mockPrisma.submission.create.mockImplementation(async ({ data }: any) => {
      const newSub = { id: `sub-${Date.now()}-${Math.random()}`, ...data, submittedAt: new Date() };
      db.submissions.push(newSub);
      return newSub;
    });

    mockPrisma.round1Room.findFirst.mockImplementation(async () => db.round1Rooms[0] || null);

    mockPrisma.round1Room.update.mockImplementation(async ({ where, data }: any) => {
      const room = db.round1Rooms.find((r) => r.id === where.id);
      if (room && data?.filled?.increment) {
        room.filled += data.filled.increment;
      }
      return room || { id: where.id, filled: 1 };
    });

    mockPrisma.round2Room.create.mockImplementation(async ({ data }: any) => {
      const newRoom = { id: `r2-${Date.now()}-${Math.random()}`, ...data, teams: [] };
      db.round2Rooms.push(newRoom);
      return newRoom;
    });

    mockPrisma.round2Room.findMany.mockImplementation(async () => {
      return db.round2Rooms.map((r) => ({
        ...r,
        teams: db.teams.filter((t) => t.round2RoomId === r.id),
      }));
    });

    mockPrisma.round3Room.createMany.mockImplementation(async ({ data }: any) => {
      for (const roomData of data) {
        if (!db.round3Rooms.find((r) => r.name === roomData.name)) {
          db.round3Rooms.push({
            id: `r3-${roomData.name.replace(/\s+/g, "-").toLowerCase()}`,
            ...roomData,
            teams: [],
            judges: [],
          });
        }
      }
      return { count: data.length };
    });

    mockPrisma.round3Room.findMany.mockImplementation(async () => {
      return db.round3Rooms.map((room) => ({
        ...room,
        teams: db.teams.filter((t) => t.round3RoomId === room.id),
        judges: db.judges.filter((j) => j.round3RoomId === room.id),
      }));
    });

    mockPrisma.round3Room.findUnique.mockImplementation(async ({ where }: any) => {
      const room = db.round3Rooms.find((r) => r.id === where.id);
      if (!room) return null;
      const roomTeams = db.teams.filter((t) => t.round3RoomId === room.id);
      return { ...room, _count: { teams: roomTeams.length } };
    });

    mockPrisma.judge.findUnique.mockImplementation(async ({ where }: any) => {
      return db.judges.find((j) => (where.id && j.id === where.id) || (where.userId && j.userId === where.userId)) || null;
    });

    mockPrisma.judge.findMany.mockImplementation(async ({ where }: any = {}) => {
      if (where?.round3RoomId) {
        return db.judges.filter((j) => j.round3RoomId === where.round3RoomId);
      }
      return [...db.judges];
    });

    mockPrisma.judge.update.mockImplementation(async ({ where, data }: any) => {
      const index = db.judges.findIndex((j) => j.id === where.id);
      if (index === -1) throw new Error("Judge not found");
      db.judges[index] = { ...db.judges[index], ...data };
      return db.judges[index];
    });

    mockPrisma.evaluation.findUnique.mockImplementation(async ({ where }: any) => {
      const { teamId, judgeId, round } = where.teamId_judgeId_round;
      return db.evaluations.find((e) => e.teamId === teamId && e.judgeId === judgeId && e.round === round) || null;
    });

    mockPrisma.evaluation.create.mockImplementation(async ({ data }: any) => {
      const newEval = { id: `eval-${Date.now()}-${Math.random()}`, status: "PENDING", ...data };
      db.evaluations.push(newEval);
      return newEval;
    });

    mockPrisma.evaluation.createMany.mockImplementation(async ({ data }: any) => {
      for (const item of data) {
        const exists = db.evaluations.find(
          (e) => e.teamId === item.teamId && e.judgeId === item.judgeId && e.round === item.round,
        );
        if (!exists) {
          db.evaluations.push({ id: `eval-${Date.now()}-${Math.random()}`, status: "PENDING", ...item });
        }
      }
      return { count: data.length };
    });

    mockPrisma.evaluation.update.mockImplementation(async ({ where, data }: any) => {
      const index = db.evaluations.findIndex((e) => e.id === where.id);
      if (index > -1) {
        db.evaluations[index] = { ...db.evaluations[index], ...data };
        return db.evaluations[index];
      }
      return null;
    });

    mockPrisma.evaluation.deleteMany.mockImplementation(async ({ where }: any) => {
      const before = db.evaluations.length;
      db.evaluations = db.evaluations.filter((e) => {
        if (where?.judgeId && where?.round && e.judgeId === where.judgeId && e.round === where.round) return false;
        if (where?.teamId && where?.round && e.teamId === where.teamId && e.round === where.round) return false;
        if (where?.round && !where?.judgeId && !where?.teamId && e.round === where.round) return false;
        return true;
      });
      return { count: before - db.evaluations.length };
    });

    mockPrisma.teamScore.upsert.mockImplementation(async ({ where, create, update }: any) => {
      const { teamId, judgeId, round } = where.teamId_judgeId_round;
      const index = db.teamScores.findIndex(
        (s) => s.teamId === teamId && s.judgeId === judgeId && s.round === round,
      );
      if (index > -1) {
        db.teamScores[index] = { ...db.teamScores[index], ...update, teamId, judgeId, round };
        return db.teamScores[index];
      } else {
        const newScore = { id: `ts-${Date.now()}-${Math.random()}`, ...create, teamId, judgeId, round };
        db.teamScores.push(newScore);
        return newScore;
      }
    });

    mockPrisma.teamScore.count.mockImplementation(async ({ where }: any = {}) => {
      if (where?.round !== undefined) {
        return db.teamScores.filter((s) => s.round === where.round).length;
      }
      return db.teamScores.length;
    });

    mockPrisma.teamScore.groupBy.mockImplementation(async ({ by, where, _avg, _count }: any) => {
      const filtered = db.teamScores.filter((s) => {
        if (where?.round && s.round !== where.round) return false;
        if (where?.totalScore?.not === null && s.totalScore === null) return false;
        return true;
      });

      const map = new Map<string, { total: number; count: number }>();
      for (const s of filtered) {
        const current = map.get(s.teamId) || { total: 0, count: 0 };
        current.total += s.totalScore;
        current.count += 1;
        map.set(s.teamId, current);
      }

      return Array.from(map.entries()).map(([teamId, data]) => ({
        teamId,
        _avg: { totalScore: parseFloat((data.total / data.count).toFixed(2)) },
        _count: { _all: data.count },
      }));
    });
  });

  it("should successfully execute end-to-end tournament across Round 1, Round 2, and Round 3", async () => {
    // =========================================================================
    // SETUP: Create Judges
    // =========================================================================
    const judge1User = { id: "u-judge-1", username: "judge_alpha", role: "JUDGE" };
    const judge2User = { id: "u-judge-2", username: "judge_beta", role: "JUDGE" };
    const judge3User = { id: "u-judge-3", username: "judge_gamma", role: "JUDGE" };
    db.users.push(judge1User, judge2User, judge3User);

    const judge1 = { id: "j1", userId: "u-judge-1", name: "Dr. Alice Turing", round3RoomId: null };
    const judge2 = { id: "j2", userId: "u-judge-2", name: "Prof. Bob Hopper", round3RoomId: null };
    const judge3 = { id: "j3", userId: "u-judge-3", name: "Dr. Clara Shannon", round3RoomId: null };
    db.judges.push(judge1, judge2, judge3);

    // =========================================================================
    // STEP 1: Register 6 Teams & Complete Round 1 Checkpoints
    // =========================================================================
    const teamNames = [
      "CyberKnights",
      "QuantumCore",
      "NeuralSync",
      "MatrixMind",
      "HeliosAI",
      "ApexDynasty",
    ];

    const teams = teamNames.map((name, i) => {
      const id = `team-${i + 1}`;
      const teamId = `HX-${100 + i + 1}`;
      const team = {
        id,
        teamId,
        name,
        status: "REGISTERED",
        submissionStatus: "NOT_SUBMITTED",
        githubRepo: null,
        presentationLink: null,
        problemStatementId: null,
        round1RoomId: null,
        round2RoomId: null,
        round3RoomId: null,
      };
      db.teams.push(team);

      // Create team leader user
      db.users.push({
        id: `u-team-${i + 1}`,
        username: teamId,
        role: "TEAM",
        teamId: id,
      });

      return team;
    });

    expect(db.teams).toHaveLength(6);

    // Complete Checkpoint 1 for all teams (Attendance)
    for (const team of teams) {
      await superAdminService.updateTeamCheckpoint1({
        teamId: team.id,
        wifi: true,
        participants: [
          { name: `${team.name} Leader`, email: `${team.name.toLowerCase()}1@test.com`, isPresent: true, role: "LEADER" },
          { name: `${team.name} Member`, email: `${team.name.toLowerCase()}2@test.com`, isPresent: true, role: "MEMBER" },
        ],
      });
    }

    const completedCp1 = db.checkpoints.filter((c) => c.checkpoint === 1 && c.status === "COMPLETED");
    expect(completedCp1).toHaveLength(6);

    // Complete Checkpoint 2 (Credential Generation & Room Connection)
    for (const team of teams) {
      const cp2Result = await superAdminService.updateTeamCheckpoint2({ teamId: team.id });
      expect(cp2Result.username).toBe(team.teamId);
      expect(cp2Result.password).toBeDefined();
    }

    // Problem Statement Selection
    for (let i = 0; i < teams.length; i++) {
      const psId = i % 2 === 0 ? "ps-ai" : "ps-web3";
      await teamService.selectProblemStatement(`u-team-${i + 1}`, psId);
    }
    expect(db.teams.every((t) => t.status === "PROBLEM_SELECTED")).toBe(true);

    // Project Submission (GitHub repo + PPT link)
    for (let i = 0; i < teams.length; i++) {
      await teamService.submitProject(`u-team-${i + 1}`, {
        githubLink: `https://github.com/hackx/${teams[i].name.toLowerCase()}`,
        pptLink: `https://drive.google.com/presentation-${teams[i].name.toLowerCase()}`,
      });
    }

    // All 6 teams should now have status = ROUND1_SUBMITTED
    expect(db.teams.every((t) => t.status === "ROUND1_SUBMITTED")).toBe(true);

    // =========================================================================
    // STEP 2: Round 1 Judging & Scoring
    // =========================================================================
    // Map teams to Judge 1 and Judge 2 for Round 1
    for (let i = 0; i < teams.length; i++) {
      const judgeId = i < 3 ? "j1" : "j2";
      await superAdminService.mapTeamToJudge(teams[i].id, judgeId);
    }
    expect(db.evaluations.filter((e) => e.round === 1)).toHaveLength(6);

    // Judges evaluate the teams in Round 1 with varied performance:
    // Scores:
    // Team 1 (CyberKnights): (9, 9, 8, 8, 9) = 8.7
    // Team 2 (QuantumCore):  (8, 8, 7, 7, 8) = 7.7
    // Team 3 (NeuralSync):   (9.5, 9.5, 9, 9, 9.5) = 9.35 -> 9.4
    // Team 4 (MatrixMind):   (7, 7, 6, 6, 7) = 6.7
    // Team 5 (HeliosAI):     (8.5, 8.5, 8, 8, 8.5) = 8.35 -> 8.4
    // Team 6 (ApexDynasty):  (6, 6, 5, 5, 6) = 5.7
    const round1Scores = [
      { innovation: 9, technical: 9, presentation: 8, feasibility: 8, impact: 9 },
      { innovation: 8, technical: 8, presentation: 7, feasibility: 7, impact: 8 },
      { innovation: 9.5, technical: 9.5, presentation: 9, feasibility: 9, impact: 9.5 },
      { innovation: 7, technical: 7, presentation: 6, feasibility: 6, impact: 7 },
      { innovation: 8.5, technical: 8.5, presentation: 8, feasibility: 8, impact: 8.5 },
      { innovation: 6, technical: 6, presentation: 5, feasibility: 5, impact: 6 },
    ];

    for (let i = 0; i < teams.length; i++) {
      const judgeUser = i < 3 ? "u-judge-1" : "u-judge-2";
      await judgeService.submitTeamScore(judgeUser, {
        teamId: teams[i].id,
        scores: round1Scores[i],
        round: 1,
      });
    }

    const completedR1Evals = db.evaluations.filter((e) => e.round === 1 && e.status === "COMPLETED");
    expect(completedR1Evals).toHaveLength(6);

    // =========================================================================
    // STEP 3: Promote Top 4 Teams to Round 2 & Allocate Round 2 Rooms
    // =========================================================================
    // Top 4 teams: NeuralSync (t3), CyberKnights (t1), HeliosAI (t5), QuantumCore (t2)
    const promotedTeamIds = ["team-3", "team-1", "team-5", "team-2"];
    await superAdminService.promoteTeamsToRound2(promotedTeamIds);

    const qualifiedForR2 = db.teams.filter((t) => t.status === "ROUND1_QUALIFIED");
    expect(qualifiedForR2).toHaveLength(4);

    // Create Round 2 rooms and assign teams
    const r2Room1 = await superAdminService.createRound2Room({ name: "AB1-201", capacity: 2 });
    const r2Room2 = await superAdminService.createRound2Room({ name: "AB1-202", capacity: 2 });

    await superAdminService.assignTeamToRoom("team-3", r2Room1.id);
    await superAdminService.assignTeamToRoom("team-1", r2Room1.id);
    await superAdminService.assignTeamToRoom("team-5", r2Room2.id);
    await superAdminService.assignTeamToRoom("team-2", r2Room2.id);

    const r2RoomsWithTeams = await superAdminService.getRound2Rooms();
    expect(r2RoomsWithTeams[0].teams).toHaveLength(2);
    expect(r2RoomsWithTeams[1].teams).toHaveLength(2);

    // =========================================================================
    // STEP 4: Round 2 Evaluation & Scoring
    // =========================================================================
    // Create Round 2 evaluations for promoted teams with Judge 1 & Judge 2
    for (const teamId of promotedTeamIds) {
      db.evaluations.push({
        id: `eval-r2-${teamId}`,
        teamId,
        judgeId: "j1",
        round: 2,
        status: "PENDING",
      });
    }

    // Judge 1 scores promoted teams in Round 2:
    // Team 3 (NeuralSync):   Inn: 9.5, Tech: 10,  Pres: 9.5, Feas: 9,   Imp: 9.5 -> Total: 9.5
    // Team 1 (CyberKnights): Inn: 9,   Tech: 9,   Pres: 8.5, Feas: 8.5, Imp: 9   -> Total: 8.9
    // Team 5 (HeliosAI):     Inn: 8.5, Tech: 8.5, Pres: 8,   Feas: 8,   Imp: 8.5 -> Total: 8.4
    // Team 2 (QuantumCore):  Inn: 7.5, Tech: 7.5, Pres: 7,   Feas: 7,   Imp: 7.5 -> Total: 7.3
    const r2Scores: Record<string, any> = {
      "team-3": { innovation: 9.5, technical: 10, presentation: 9.5, feasibility: 9, impact: 9.5 },
      "team-1": { innovation: 9, technical: 9, presentation: 8.5, feasibility: 8.5, impact: 9 },
      "team-5": { innovation: 8.5, technical: 8.5, presentation: 8, feasibility: 8, impact: 8.5 },
      "team-2": { innovation: 7.5, technical: 7.5, presentation: 7, feasibility: 7, impact: 7.5 },
    };

    for (const teamId of promotedTeamIds) {
      await judgeService.submitTeamScore("u-judge-1", {
        teamId,
        scores: r2Scores[teamId],
        round: 2,
      });
    }

    const r2ScoresCount = await mockPrisma.teamScore.count({ where: { round: 2 } });
    expect(r2ScoresCount).toBe(4);

    // =========================================================================
    // STEP 5: Round 3 Finalist Selection & Snake Auto-Assignment
    // =========================================================================
    // Get Round 3 candidates ranked by Round 2 scores
    const candidates = await superAdminService.getRound3Candidates(2);
    expect(candidates[0].id).toBe("team-3"); // NeuralSync has highest score
    expect(candidates[1].id).toBe("team-1"); // CyberKnights
    expect(candidates[2].id).toBe("team-5"); // HeliosAI
    expect(candidates[3].id).toBe("team-2"); // QuantumCore

    // Select Top 3 Finalists for Round 3
    const topFinalists = await superAdminService.selectTopTeamsForRound3(3, 2);
    expect(topFinalists).toHaveLength(3);
    expect(topFinalists.map((f) => f.id)).toEqual(["team-3", "team-1", "team-5"]);

    const round3Qualified = db.teams.filter((t) => t.status === "ROUND2_QUALIFIED");
    expect(round3Qualified).toHaveLength(3);

    // Provision Round 3 meeting rooms
    const r3Rooms = await superAdminService.getRound3Rooms();
    expect(r3Rooms).toHaveLength(3);

    // Staff meeting rooms with judges:
    // Room 1: Judge 1
    // Room 2: Judge 2
    // Room 3: Judge 3
    await superAdminService.assignJudgeToRound3Room("j1", r3Rooms[0].id);
    await superAdminService.assignJudgeToRound3Room("j2", r3Rooms[1].id);
    await superAdminService.assignJudgeToRound3Room("j3", r3Rooms[2].id);

    // Auto-assign finalists to meeting rooms using snake algorithm
    const distributionSummary = await superAdminService.autoAssignRound3Teams();
    expect(distributionSummary.teamsAssigned).toBe(3);

    // Verify snake distribution:
    // Team 3 (Rank 1) -> Meeting Room 1 (index 0)
    // Team 1 (Rank 2) -> Meeting Room 2 (index 1)
    // Team 5 (Rank 3) -> Meeting Room 3 (index 2)
    const assignedTeam3 = db.teams.find((t) => t.id === "team-3");
    const assignedTeam1 = db.teams.find((t) => t.id === "team-1");
    const assignedTeam5 = db.teams.find((t) => t.id === "team-5");

    expect(assignedTeam3?.round3RoomId).toBe(r3Rooms[0].id);
    expect(assignedTeam1?.round3RoomId).toBe(r3Rooms[1].id);
    expect(assignedTeam5?.round3RoomId).toBe(r3Rooms[2].id);

    // Verify evaluations were created for the judge assigned to each room
    expect(db.evaluations.find((e) => e.teamId === "team-3" && e.judgeId === "j1" && e.round === 3)).toBeDefined();
    expect(db.evaluations.find((e) => e.teamId === "team-1" && e.judgeId === "j2" && e.round === 3)).toBeDefined();
    expect(db.evaluations.find((e) => e.teamId === "team-5" && e.judgeId === "j3" && e.round === 3)).toBeDefined();

    // =========================================================================
    // STEP 6: Round 3 Final Judging & Championship Determination
    // =========================================================================
    // Final pitch scoring:
    // Judge 1 scores Team 3: (10, 10, 10, 9.5, 10) -> Total: 9.9
    // Judge 2 scores Team 1: (9, 9.5, 9, 9, 9)     -> Total: 9.2
    // Judge 3 scores Team 5: (8.5, 9, 8.5, 8.5, 9) -> Total: 8.7
    await judgeService.submitTeamScore("u-judge-1", {
      teamId: "team-3",
      scores: { innovation: 10, technical: 10, presentation: 10, feasibility: 9.5, impact: 10 },
      round: 3,
    });

    await judgeService.submitTeamScore("u-judge-2", {
      teamId: "team-1",
      scores: { innovation: 9, technical: 9.5, presentation: 9, feasibility: 9, impact: 9 },
      round: 3,
    });

    await judgeService.submitTeamScore("u-judge-3", {
      teamId: "team-5",
      scores: { innovation: 8.5, technical: 9, presentation: 8.5, feasibility: 8.5, impact: 9 },
      round: 3,
    });

    // Verify final evaluations are all marked COMPLETED
    const finalEvals = db.evaluations.filter((e) => e.round === 3);
    expect(finalEvals).toHaveLength(3);
    expect(finalEvals.every((e) => e.status === "COMPLETED")).toBe(true);

    // Verify tournament champion
    const finalScores = db.teamScores
      .filter((s) => s.round === 3)
      .sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));

    expect(finalScores).toHaveLength(3);
    expect(finalScores[0].teamId).toBe("team-3"); // NeuralSync wins!
    expect(finalScores[0].totalScore).toBe(9.9);
    expect(finalScores[1].teamId).toBe("team-1"); // CyberKnights 2nd
    expect(finalScores[1].totalScore).toBe(9.1);
    expect(finalScores[2].teamId).toBe("team-5"); // HeliosAI 3rd
    expect(finalScores[2].totalScore).toBe(8.7);
  });
});
