import { describe, it, expect, beforeEach } from "vitest";
import { mockPrisma, resetPrismaMocks } from "./helpers/mockPrisma";
import { superAdminService } from "../services/superAdminService";
import { judgeService } from "../services/judgeService";

describe("Round 2 Semi-Finals & Workflow Tests", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  describe("Team Promotion to Round 2", () => {
    it("should promote selected teams by setting status to ROUND1_QUALIFIED", async () => {
      const targetTeamIds = ["team-1", "team-2", "team-3"];

      mockPrisma.team.updateMany.mockResolvedValue({ count: 3 });

      const result = await superAdminService.promoteTeamsToRound2(targetTeamIds);

      expect(mockPrisma.team.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: targetTeamIds },
        },
        data: {
          status: "ROUND1_QUALIFIED",
        },
      });
      expect(result.count).toBe(3);
    });

    it("should handle empty team list gracefully", async () => {
      mockPrisma.team.updateMany.mockResolvedValue({ count: 0 });

      const result = await superAdminService.promoteTeamsToRound2([]);

      expect(mockPrisma.team.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: [] },
        },
        data: {
          status: "ROUND1_QUALIFIED",
        },
      });
      expect(result.count).toBe(0);
    });
  });

  describe("Round 2 Room Creation & Listing", () => {
    it("should create a Round 2 room with custom capacity and block", async () => {
      const roomPayload = {
        name: "AB2-301",
        capacity: 8,
      };

      mockPrisma.round2Room.create.mockResolvedValue({
        id: "r2-1",
        name: "AB2-301",
        block: "AB1",
        capacity: 8,
      });

      const created = await superAdminService.createRound2Room(roomPayload);

      expect(mockPrisma.round2Room.create).toHaveBeenCalledWith({
        data: roomPayload,
      });
      expect(created.id).toBe("r2-1");
      expect(created.name).toBe("AB2-301");
    });

    it("should retrieve Round 2 rooms including assigned teams and judges", async () => {
      const mockRooms = [
        {
          id: "r2-1",
          name: "AB2-301",
          teams: [{ id: "t1", name: "Team Rocket", teamId: "T001", status: "ROUND1_QUALIFIED" }],
          judges: [{ id: "j1", name: "Judge 1", user: { username: "judge1" }, evaluations: [] }],
        },
        {
          id: "r2-2",
          name: "AB2-302",
          teams: [],
          judges: [],
        },
      ];

      mockPrisma.round2Room.createMany.mockResolvedValue({ count: 6 });
      mockPrisma.round2Room.findMany.mockResolvedValue(mockRooms);

      const rooms = await superAdminService.getRound2Rooms();

      expect(mockPrisma.round2Room.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
        include: {
          teams: {
            orderBy: { name: "asc" },
            select: { id: true, name: true, teamId: true, status: true },
          },
          judges: {
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
              user: { select: { username: true } },
              evaluations: { where: { round: 2 }, select: { id: true, status: true } },
            },
          },
        },
      });
      expect(rooms).toHaveLength(2);
      expect(rooms[0].teams).toHaveLength(1);
      expect(rooms[0].judges).toHaveLength(1);
    });
  });

  describe("Round 2 Team Room Assignment", () => {
    it("should assign a team to a Round 2 room by setting round2RoomId", async () => {
      mockPrisma.team.findFirst.mockResolvedValue({
        id: "t1",
        name: "Team Rocket",
      });
      mockPrisma.round2Room.findFirst.mockResolvedValue({
        id: "r2-1",
        name: "AB2-301",
      });
      mockPrisma.team.update.mockResolvedValue({
        id: "t1",
        name: "Team Rocket",
        round2RoomId: "r2-1",
      });
      mockPrisma.evaluation.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.judge.findMany.mockResolvedValue([]);

      const result = await superAdminService.assignTeamToRoom("t1", "r2-1");

      expect(mockPrisma.team.update).toHaveBeenCalledWith({
        where: { id: "t1" },
        data: { round2RoomId: "r2-1" },
      });
      expect(result.round2RoomId).toBe("r2-1");
    });
  });

  describe("Round 2 Judge Assignment Audit & Behavior", () => {
    it("should assign judge to room by setting round2RoomId and creating round 2 evaluations", async () => {
      mockPrisma.judge.findFirst.mockResolvedValue({
        id: "judge-1",
      });
      mockPrisma.round2Room.findFirst.mockResolvedValue({
        id: "r2-1",
        name: "AB2-301",
      });
      mockPrisma.evaluation.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.judge.update.mockResolvedValue({
        id: "judge-1",
        round2RoomId: "r2-1",
      });
      mockPrisma.team.findMany.mockResolvedValue([
        { id: "team-1" },
        { id: "team-2" },
      ]);
      mockPrisma.evaluation.createMany.mockResolvedValue({ count: 2 });

      const result = await superAdminService.assignJudgeToRoom("judge-1", "r2-1");

      expect(mockPrisma.judge.update).toHaveBeenCalledWith({
        where: { id: "judge-1" },
        data: { round2RoomId: "r2-1" },
      });
      expect(mockPrisma.evaluation.createMany).toHaveBeenCalledWith({
        data: [
          { teamId: "team-1", judgeId: "judge-1", round: 2 },
          { teamId: "team-2", judgeId: "judge-1", round: 2 },
        ],
        skipDuplicates: true,
      });
      expect(result.id).toBe("judge-1");
      expect(result.round2RoomId).toBe("r2-1");
    });
  });

  describe("Round 2 Judging & Scoring", () => {
    it("should retrieve assigned teams filtered specifically by round 2", async () => {
      mockPrisma.judge.findUnique.mockResolvedValue({
        id: "judge-1",
        userId: "u-judge",
      });

      mockPrisma.evaluation.findMany.mockResolvedValue([
        {
          id: "eval-r2-1",
          status: "PENDING",
          round: 2,
          team: {
            id: "t1",
            name: "Team Alpha",
            status: "ROUND1_QUALIFIED",
            participants: [],
            problemStatement: null,
            submissions: [],
            teamScores: [],
            round1Room: null,
            round3Room: null,
          },
        },
      ]);

      const teams = await judgeService.getAssignedTeams("u-judge", 2);

      expect(mockPrisma.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            judgeId: "judge-1",
            round: 2,
          },
        }),
      );
      expect(teams).toHaveLength(1);
      expect(teams[0].round).toBe(2);
      expect(teams[0].evaluated).toBe(false);
    });

    it("should submit Round 2 scores with round: 2 and calculate total weighted score", async () => {
      mockPrisma.judge.findUnique.mockResolvedValue({
        id: "judge-1",
        userId: "u-judge",
      });

      mockPrisma.evaluation.findUnique.mockResolvedValue({
        id: "eval-r2-1",
        teamId: "t1",
        judgeId: "judge-1",
        round: 2,
        status: "PENDING",
      });

      // Innovation: 10 * 0.25 = 2.5
      // Technical: 10 * 0.30 = 3.0
      // Presentation: 10 * 0.15 = 1.5
      // Feasibility: 10 * 0.15 = 1.5
      // Impact: 10 * 0.15 = 1.5
      // Total: 10.0
      const scores = {
        innovation: 10,
        technical: 10,
        presentation: 10,
        feasibility: 10,
        impact: 10,
        feedback: "Outstanding Round 2 presentation and progress",
      };

      mockPrisma.teamScore.upsert.mockResolvedValue({
        id: "ts-r2-1",
        teamId: "t1",
        judgeId: "judge-1",
        round: 2,
        totalScore: 10.0,
      });

      mockPrisma.evaluation.update.mockResolvedValue({
        id: "eval-r2-1",
        status: "COMPLETED",
      });

      const scoreResult = await judgeService.submitTeamScore("u-judge", {
        teamId: "t1",
        scores,
        round: 2,
      });

      expect(mockPrisma.teamScore.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            teamId_judgeId_round: {
              teamId: "t1",
              judgeId: "judge-1",
              round: 2,
            },
          },
          create: expect.objectContaining({
            round: 2,
            totalScore: 10.0,
          }),
        }),
      );

      expect(mockPrisma.evaluation.update).toHaveBeenCalledWith({
        where: { id: "eval-r2-1" },
        data: { status: "COMPLETED" },
      });

      expect(scoreResult.totalScore).toBe(10.0);
      expect(scoreResult.round).toBe(2);
    });

    it("should retrieve specific team score for Round 2", async () => {
      mockPrisma.judge.findUnique.mockResolvedValue({
        id: "judge-1",
        userId: "u-judge",
      });

      mockPrisma.teamScore.findUnique.mockResolvedValue({
        id: "ts-r2-1",
        teamId: "t1",
        judgeId: "judge-1",
        round: 2,
        totalScore: 9.2,
      });

      const score = await judgeService.getTeamScore("u-judge", "t1", 2);

      expect(mockPrisma.teamScore.findUnique).toHaveBeenCalledWith({
        where: {
          teamId_judgeId_round: {
            teamId: "t1",
            judgeId: "judge-1",
            round: 2,
          },
        },
      });
      expect(score?.totalScore).toBe(9.2);
    });

    it("should update evaluation status directly for Round 2", async () => {
      mockPrisma.judge.findUnique.mockResolvedValue({
        id: "judge-1",
        userId: "u-judge",
      });

      mockPrisma.evaluation.findUnique.mockResolvedValue({
        id: "eval-r2-1",
      });

      mockPrisma.evaluation.update.mockResolvedValue({
        id: "eval-r2-1",
        status: "COMPLETED",
      });

      const updated = await judgeService.updateEvaluationStatus(
        "u-judge",
        "t1",
        "COMPLETED",
        2,
      );

      expect(mockPrisma.evaluation.update).toHaveBeenCalledWith({
        where: { id: "eval-r2-1" },
        data: { status: "COMPLETED" },
      });
      expect(updated.status).toBe("COMPLETED");
    });
  });
});
