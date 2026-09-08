import { describe, it, expect, beforeEach } from "vitest";
import { mockPrisma, resetPrismaMocks } from "./helpers/mockPrisma";
import { superAdminService } from "../services/superAdminService";
import { judgeService } from "../services/judgeService";

describe("Round 3 Finals & Meeting Room Management Tests", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  describe("Candidate Ranking & Score Aggregation", () => {
    it("should aggregate Round 2 scores and rank candidates descending by average score", async () => {
      mockPrisma.teamScore.groupBy.mockResolvedValue([
        { teamId: "t1", _avg: { totalScore: 9.5 }, _count: { _all: 2 } },
        { teamId: "t2", _avg: { totalScore: 7.8 }, _count: { _all: 2 } },
        { teamId: "t3", _avg: { totalScore: 8.9 }, _count: { _all: 1 } },
      ]);

      mockPrisma.team.findMany.mockResolvedValue([
        { id: "t1", name: "Team One", teamId: "T001", status: "ROUND1_QUALIFIED", round3Room: null },
        { id: "t2", name: "Team Two", teamId: "T002", status: "ROUND1_QUALIFIED", round3Room: null },
        { id: "t3", name: "Team Three", teamId: "T003", status: "ROUND1_QUALIFIED", round3Room: null },
        { id: "t4", name: "Team Four", teamId: "T004", status: "ROUND1_QUALIFIED", round3Room: null },
      ]);

      const candidates = await superAdminService.getRound3Candidates(2);

      expect(mockPrisma.teamScore.groupBy).toHaveBeenCalledWith({
        by: ["teamId"],
        where: { round: 2, totalScore: { not: null } },
        _avg: { totalScore: true },
        _count: { _all: true },
      });

      expect(candidates).toHaveLength(4);
      // t1: 9.5, t3: 8.9, t2: 7.8, t4: null (unscored)
      expect(candidates[0].id).toBe("t1");
      expect(candidates[0].averageScore).toBe(9.5);
      expect(candidates[1].id).toBe("t3");
      expect(candidates[1].averageScore).toBe(8.9);
      expect(candidates[2].id).toBe("t2");
      expect(candidates[2].averageScore).toBe(7.8);
      expect(candidates[3].id).toBe("t4");
      expect(candidates[3].averageScore).toBeNull();
    });
  });

  describe("Selection of Top Teams for Round 3", () => {
    it("should promote top scored candidates to ROUND2_QUALIFIED", async () => {
      mockPrisma.team.count.mockResolvedValue(0); // No teams currently assigned to rooms

      // Mock candidates
      mockPrisma.teamScore.groupBy.mockResolvedValue([
        { teamId: "t1", _avg: { totalScore: 9.5 }, _count: { _all: 2 } },
        { teamId: "t2", _avg: { totalScore: 8.5 }, _count: { _all: 2 } },
      ]);
      mockPrisma.team.findMany.mockResolvedValue([
        { id: "t1", name: "Team 1", status: "ROUND1_QUALIFIED" },
        { id: "t2", name: "Team 2", status: "ROUND1_QUALIFIED" },
      ]);
      mockPrisma.team.updateMany.mockResolvedValue({ count: 2 });

      const selected = await superAdminService.selectTopTeamsForRound3(2);

      expect(selected).toHaveLength(2);
      expect(mockPrisma.team.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["t1", "t2"] } },
        data: { status: "ROUND2_QUALIFIED" },
      });
    });

    it("should reject re-selection if any teams are already assigned to Round 3 rooms", async () => {
      mockPrisma.team.count.mockResolvedValue(3); // 3 teams already assigned

      await expect(superAdminService.selectTopTeamsForRound3(30)).rejects.toThrow(
        "Some teams are already assigned to Round 3 rooms. Release room assignments before re-selecting.",
      );
      expect(mockPrisma.team.updateMany).not.toHaveBeenCalled();
    });

    it("should throw error if no teams have scores yet in source round", async () => {
      mockPrisma.team.count.mockResolvedValue(0);
      mockPrisma.teamScore.groupBy.mockResolvedValue([]);
      mockPrisma.team.findMany.mockResolvedValue([
        { id: "t1", name: "Team 1", status: "ROUND1_QUALIFIED" },
      ]);

      await expect(superAdminService.selectTopTeamsForRound3(30, 2)).rejects.toThrow(
        "No teams have scores from Round 2 yet.",
      );
    });
  });

  describe("Room Provisioning & Judge Assignment", () => {
    it("should provision default Round 3 meeting rooms if not already existing", async () => {
      mockPrisma.round3Room.createMany.mockResolvedValue({ count: 3 });
      mockPrisma.round3Room.findMany.mockResolvedValue([
        { id: "room-1", name: "Meeting Room 1", capacity: 10, teams: [], judges: [] },
        { id: "room-2", name: "Meeting Room 2", capacity: 10, teams: [], judges: [] },
        { id: "room-3", name: "Meeting Room 3", capacity: 10, teams: [], judges: [] },
      ]);

      const rooms = await superAdminService.getRound3Rooms();

      expect(mockPrisma.round3Room.createMany).toHaveBeenCalledWith({
        data: [
          { name: "Meeting Room 1", capacity: 10 },
          { name: "Meeting Room 2", capacity: 10 },
          { name: "Meeting Room 3", capacity: 10 },
        ],
        skipDuplicates: true,
      });
      expect(rooms).toHaveLength(3);
    });

    it("should assign judge to Round 3 room and create evaluations for all teams currently in that room", async () => {
      mockPrisma.judge.findUnique.mockResolvedValue({ id: "j1", name: "Dr. Smith" });
      mockPrisma.round3Room.findUnique.mockResolvedValue({ id: "room-1", name: "Meeting Room 1" });
      mockPrisma.evaluation.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.judge.update.mockResolvedValue({ id: "j1", round3RoomId: "room-1" });
      mockPrisma.team.findMany.mockResolvedValue([{ id: "t1" }, { id: "t2" }]);
      mockPrisma.evaluation.createMany.mockResolvedValue({ count: 2 });

      await superAdminService.assignJudgeToRound3Room("j1", "room-1");

      expect(mockPrisma.evaluation.deleteMany).toHaveBeenCalledWith({
        where: { judgeId: "j1", round: 3 },
      });
      expect(mockPrisma.judge.update).toHaveBeenCalledWith({
        where: { id: "j1" },
        data: { round3RoomId: "room-1" },
      });
      expect(mockPrisma.evaluation.createMany).toHaveBeenCalledWith({
        data: [
          { teamId: "t1", judgeId: "j1", round: 3 },
          { teamId: "t2", judgeId: "j1", round: 3 },
        ],
        skipDuplicates: true,
      });
    });

    it("should remove judge from Round 3 room and clear assigned evaluations", async () => {
      mockPrisma.judge.findUnique.mockResolvedValue({ id: "j1", round3RoomId: "room-1" });
      mockPrisma.evaluation.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.judge.update.mockResolvedValue({ id: "j1", round3RoomId: null });

      await superAdminService.removeJudgeFromRound3Room("j1");

      expect(mockPrisma.evaluation.deleteMany).toHaveBeenCalledWith({
        where: { judgeId: "j1", round: 3 },
      });
      expect(mockPrisma.judge.update).toHaveBeenCalledWith({
        where: { id: "j1" },
        data: { round3RoomId: null },
      });
    });
  });

  describe("Snake Auto-Assignment Algorithm", () => {
    it("should reject auto-assignment if any meeting room has no judges", async () => {
      mockPrisma.round3Room.findMany.mockResolvedValue([
        { id: "room-1", name: "Meeting Room 1", capacity: 10, judges: [{ id: "j1" }] },
        { id: "room-2", name: "Meeting Room 2", capacity: 10, judges: [] }, // unstaffed
      ]);

      await expect(superAdminService.autoAssignRound3Teams()).rejects.toThrow(
        "Assign judges to these rooms first: Meeting Room 2",
      );
    });

    it("should reject auto-assignment if Round 3 judging has already started", async () => {
      mockPrisma.round3Room.findMany.mockResolvedValue([
        { id: "room-1", name: "Meeting Room 1", capacity: 10, judges: [{ id: "j1" }] },
      ]);
      mockPrisma.teamScore.count.mockResolvedValue(1); // 1 score already exists

      await expect(superAdminService.autoAssignRound3Teams()).rejects.toThrow(
        "Round 3 judging has already started. Teams cannot be redistributed.",
      );
    });

    it("should reject auto-assignment if team count exceeds total room capacity", async () => {
      mockPrisma.round3Room.findMany.mockResolvedValue([
        { id: "room-1", name: "Meeting Room 1", capacity: 2, judges: [{ id: "j1" }] },
      ]);
      mockPrisma.teamScore.count.mockResolvedValue(0);

      // Mock 3 selected teams
      mockPrisma.teamScore.groupBy.mockResolvedValue([
        { teamId: "t1", _avg: { totalScore: 9 }, _count: { _all: 1 } },
        { teamId: "t2", _avg: { totalScore: 8 }, _count: { _all: 1 } },
        { teamId: "t3", _avg: { totalScore: 7 }, _count: { _all: 1 } },
      ]);
      mockPrisma.team.findMany.mockResolvedValue([
        { id: "t1", status: "ROUND2_QUALIFIED" },
        { id: "t2", status: "ROUND2_QUALIFIED" },
        { id: "t3", status: "ROUND2_QUALIFIED" },
      ]);

      await expect(superAdminService.autoAssignRound3Teams()).rejects.toThrow(
        "Selected teams (3) exceed total room capacity (2).",
      );
    });

    it("should evenly balance teams across meeting rooms in a snake distribution pattern", async () => {
      const rooms = [
        { id: "r1", name: "Meeting Room 1", capacity: 5, judges: [{ id: "j1" }] },
        { id: "r2", name: "Meeting Room 2", capacity: 5, judges: [{ id: "j2" }] },
        { id: "r3", name: "Meeting Room 3", capacity: 5, judges: [{ id: "j3" }] },
      ];

      mockPrisma.round3Room.findMany.mockResolvedValue(rooms);
      mockPrisma.teamScore.count.mockResolvedValue(0);

      // 6 qualified teams: expected snake order:
      // Team 1 -> Room 1 (index 0)
      // Team 2 -> Room 2 (index 1)
      // Team 3 -> Room 3 (index 2)
      // Team 4 -> Room 3 (index 2)
      // Team 5 -> Room 2 (index 1)
      // Team 6 -> Room 1 (index 0)
      const mockCandidates = [
        { teamId: "t1", _avg: { totalScore: 9.8 }, _count: { _all: 1 } },
        { teamId: "t2", _avg: { totalScore: 9.5 }, _count: { _all: 1 } },
        { teamId: "t3", _avg: { totalScore: 9.2 }, _count: { _all: 1 } },
        { teamId: "t4", _avg: { totalScore: 8.8 }, _count: { _all: 1 } },
        { teamId: "t5", _avg: { totalScore: 8.4 }, _count: { _all: 1 } },
        { teamId: "t6", _avg: { totalScore: 8.0 }, _count: { _all: 1 } },
      ];
      mockPrisma.teamScore.groupBy.mockResolvedValue(mockCandidates);
      mockPrisma.team.findMany.mockResolvedValue([
        { id: "t1", status: "ROUND2_QUALIFIED" },
        { id: "t2", status: "ROUND2_QUALIFIED" },
        { id: "t3", status: "ROUND2_QUALIFIED" },
        { id: "t4", status: "ROUND2_QUALIFIED" },
        { id: "t5", status: "ROUND2_QUALIFIED" },
        { id: "t6", status: "ROUND2_QUALIFIED" },
      ]);

      mockPrisma.evaluation.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.team.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.team.update.mockResolvedValue({});
      mockPrisma.evaluation.createMany.mockResolvedValue({ count: 6 });

      const summary = await superAdminService.autoAssignRound3Teams();

      expect(summary.teamsAssigned).toBe(6);
      expect(summary.roomsAssigned).toEqual([
        { roomId: "r1", teams: 2 },
        { roomId: "r2", teams: 2 },
        { roomId: "r3", teams: 2 },
      ]);

      // Verify team room assignment calls match snake distribution
      expect(mockPrisma.team.update).toHaveBeenCalledWith({
        where: { id: "t1" },
        data: { round3RoomId: "r1" },
      });
      expect(mockPrisma.team.update).toHaveBeenCalledWith({
        where: { id: "t2" },
        data: { round3RoomId: "r2" },
      });
      expect(mockPrisma.team.update).toHaveBeenCalledWith({
        where: { id: "t3" },
        data: { round3RoomId: "r3" },
      });
      expect(mockPrisma.team.update).toHaveBeenCalledWith({
        where: { id: "t4" },
        data: { round3RoomId: "r3" },
      });
      expect(mockPrisma.team.update).toHaveBeenCalledWith({
        where: { id: "t5" },
        data: { round3RoomId: "r2" },
      });
      expect(mockPrisma.team.update).toHaveBeenCalledWith({
        where: { id: "t6" },
        data: { round3RoomId: "r1" },
      });

      // Verify evaluations are created for every judge in each room
      expect(mockPrisma.evaluation.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          { teamId: "t1", judgeId: "j1", round: 3 },
          { teamId: "t6", judgeId: "j1", round: 3 },
          { teamId: "t2", judgeId: "j2", round: 3 },
          { teamId: "t5", judgeId: "j2", round: 3 },
          { teamId: "t3", judgeId: "j3", round: 3 },
          { teamId: "t4", judgeId: "j3", round: 3 },
        ]),
        skipDuplicates: true,
      });
    });
  });

  describe("Manual Team Assignment to Round 3 Room", () => {
    it("should reject manual team assignment if the room is at full capacity", async () => {
      mockPrisma.team.findUnique.mockResolvedValue({ id: "t1", round3RoomId: null });
      mockPrisma.round3Room.findUnique.mockResolvedValue({
        id: "room-1",
        name: "Meeting Room 1",
        capacity: 10,
        _count: { teams: 10 },
      });

      await expect(
        superAdminService.assignTeamToRound3Room("t1", "room-1"),
      ).rejects.toThrow("Meeting Room 1 is at full capacity (10).");
    });

    it("should assign team to room, delete old evaluations, and create evaluations for room judges", async () => {
      mockPrisma.team.findUnique.mockResolvedValue({ id: "t1", round3RoomId: null });
      mockPrisma.round3Room.findUnique.mockResolvedValue({
        id: "room-1",
        name: "Meeting Room 1",
        capacity: 10,
        _count: { teams: 3 },
      });

      mockPrisma.team.update.mockResolvedValue({ id: "t1", round3RoomId: "room-1" });
      mockPrisma.evaluation.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.judge.findMany.mockResolvedValue([{ id: "j1" }, { id: "j2" }]);
      mockPrisma.evaluation.createMany.mockResolvedValue({ count: 2 });

      const updated = await superAdminService.assignTeamToRound3Room("t1", "room-1");

      expect(mockPrisma.team.update).toHaveBeenCalledWith({
        where: { id: "t1" },
        data: { round3RoomId: "room-1" },
      });
      expect(mockPrisma.evaluation.deleteMany).toHaveBeenCalledWith({
        where: { teamId: "t1", round: 3 },
      });
      expect(mockPrisma.evaluation.createMany).toHaveBeenCalledWith({
        data: [
          { teamId: "t1", judgeId: "j1", round: 3 },
          { teamId: "t1", judgeId: "j2", round: 3 },
        ],
        skipDuplicates: true,
      });
      expect(updated.round3RoomId).toBe("room-1");
    });
  });

  describe("Round 3 Final Judging & Scoring", () => {
    it("should record final scores with round: 3 and mark evaluation as completed", async () => {
      mockPrisma.judge.findUnique.mockResolvedValue({ id: "j1", userId: "u-judge" });
      mockPrisma.evaluation.findUnique.mockResolvedValue({
        id: "eval-r3-1",
        teamId: "t1",
        judgeId: "j1",
        round: 3,
        status: "PENDING",
      });

      const scores = {
        innovation: 9,
        technical: 9.5,
        presentation: 9,
        feasibility: 8.5,
        impact: 9,
        feedback: "Exceptional final pitch and working system",
      };

      // 9*0.25 + 9.5*0.30 + 9*0.15 + 8.5*0.15 + 9*0.15
      // = 2.25 + 2.85 + 1.35 + 1.275 + 1.35 = 9.075 -> 9.1
      mockPrisma.teamScore.upsert.mockResolvedValue({
        id: "ts-r3-1",
        teamId: "t1",
        judgeId: "j1",
        round: 3,
        totalScore: 9.1,
      });
      mockPrisma.evaluation.update.mockResolvedValue({ id: "eval-r3-1", status: "COMPLETED" });

      const scoreResult = await judgeService.submitTeamScore("u-judge", {
        teamId: "t1",
        scores,
        round: 3,
      });

      expect(mockPrisma.teamScore.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            teamId_judgeId_round: {
              teamId: "t1",
              judgeId: "j1",
              round: 3,
            },
          },
          create: expect.objectContaining({
            round: 3,
            totalScore: 9.1,
          }),
        }),
      );
      expect(scoreResult.totalScore).toBe(9.1);
      expect(mockPrisma.evaluation.update).toHaveBeenCalledWith({
        where: { id: "eval-r3-1" },
        data: { status: "COMPLETED" },
      });
    });
  });
});
