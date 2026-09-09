import { describe, it, expect, beforeEach } from "vitest";
import { mockPrisma, resetPrismaMocks } from "./helpers/mockPrisma";
import { superAdminService } from "../services/superAdminService";
import { judgeService } from "../services/judgeService";
import { teamService } from "../services/teamService";

describe("Round 1 Evaluation & Workflow Tests", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  describe("Checkpoint 1: Participant Attendance & Verification", () => {
    it("should complete Checkpoint 1 when all participants are present", async () => {
      const payload = {
        teamId: "team-123",
        wifi: true,
        participants: [
          { name: "Alice", email: "alice@example.com", isPresent: true, role: "LEADER" as const },
          { name: "Bob", email: "bob@example.com", isPresent: true, role: "MEMBER" as const },
        ],
      };

      mockPrisma.teamParticipant.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.teamParticipant.create.mockResolvedValue({});
      mockPrisma.teamCheckpoint.upsert.mockResolvedValue({
        checkpoint: 1,
        status: "COMPLETED",
        data: { wifi: true, totalParticipants: 2, presentCount: 2 },
      });

      const result = await superAdminService.updateTeamCheckpoint1(payload);

      expect(mockPrisma.teamParticipant.deleteMany).toHaveBeenCalledWith({
        where: { teamId: "team-123" },
      });
      expect(mockPrisma.teamParticipant.create).toHaveBeenCalledTimes(2);
      expect(mockPrisma.teamCheckpoint.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { teamId_checkpoint: { teamId: "team-123", checkpoint: 1 } },
          update: expect.objectContaining({
            status: "COMPLETED",
          }),
        }),
      );
      expect(result.status).toBe("COMPLETED");
    });

    it("should set status to PARTIALLY_COMPLETED when at least 2 are present but some are missing", async () => {
      const payload = {
        teamId: "team-123",
        wifi: false,
        participants: [
          { name: "Alice", email: "alice@example.com", isPresent: true, role: "LEADER" as const },
          { name: "Bob", email: "bob@example.com", isPresent: true, role: "MEMBER" as const },
          { name: "Charlie", email: "charlie@example.com", isPresent: false, role: "MEMBER" as const },
        ],
      };

      mockPrisma.teamParticipant.deleteMany.mockResolvedValue({ count: 3 });
      mockPrisma.teamParticipant.create.mockResolvedValue({});
      mockPrisma.teamCheckpoint.upsert.mockResolvedValue({
        checkpoint: 1,
        status: "PARTIALLY_COMPLETED",
        data: { notes: "Only 2 out of 3 participants were present" },
      });

      const result = await superAdminService.updateTeamCheckpoint1(payload);

      expect(mockPrisma.teamCheckpoint.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            status: "PARTIALLY_COMPLETED",
          }),
        }),
      );
      expect(result.status).toBe("PARTIALLY_COMPLETED");
    });

    it("should reject Checkpoint 1 if fewer than 2 participants are present", async () => {
      const payload = {
        teamId: "team-123",
        wifi: true,
        participants: [
          { name: "Alice", email: "alice@example.com", isPresent: true, role: "LEADER" as const },
          { name: "Bob", email: "bob@example.com", isPresent: false, role: "MEMBER" as const },
        ],
      };

      await expect(superAdminService.updateTeamCheckpoint1(payload)).rejects.toThrow(
        "At least 2 participants must be marked as present to complete checkpoint 1",
      );
      expect(mockPrisma.teamParticipant.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe("Checkpoint 2: Team Credential Generation & Room Connection", () => {
    it("should generate credentials and link Round 1 room when team exists", async () => {
      mockPrisma.team.findUnique.mockResolvedValue({
        id: "team-id-1",
        teamId: "TEAM-ALPHA",
      });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.teamCheckpoint.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: "user-id-1", username: "TEAM-ALPHA" });
      mockPrisma.round1Room.findFirst.mockResolvedValue({ id: "room-1", name: "001" });
      mockPrisma.round1Room.update.mockResolvedValue({ id: "room-1", name: "001", filled: 1 });
      mockPrisma.teamCheckpoint.upsert.mockResolvedValue({ checkpoint: 2, status: "COMPLETED" });
      mockPrisma.team.update.mockResolvedValue({
        round1Room: { id: "room-1", name: "001" },
      });

      const result = await superAdminService.updateTeamCheckpoint2({ teamId: "team-id-1" });

      expect(result.username).toBe("TEAM-ALPHA");
      expect(result.password).toBeDefined();
      expect(result.round1Room?.name).toBe("001");
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            username: "TEAM-ALPHA",
            role: "TEAM",
          }),
        }),
      );
    });

    it("should throw error if team is not found for Checkpoint 2", async () => {
      mockPrisma.team.findUnique.mockResolvedValue(null);

      await expect(
        superAdminService.updateTeamCheckpoint2({ teamId: "non-existent" }),
      ).rejects.toThrow("Team not found");
    });
  });

  describe("Problem Statement Selection & System Lock", () => {
    it("should allow team to select problem statement when not locked", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "u1",
        participantTeam: { id: "t1" },
      });
      mockPrisma.systemSettings.findUnique.mockResolvedValue({
        key: "problem_statements_locked",
        value: "false",
      });
      mockPrisma.team.update.mockResolvedValue({
        id: "t1",
        problemStatementId: "ps-101",
        status: "PROBLEM_SELECTED",
      });

      const result = await teamService.selectProblemStatement("u1", "ps-101");

      expect(result.status).toBe("PROBLEM_SELECTED");
      expect(mockPrisma.team.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "t1" },
          data: {
            problemStatementId: "ps-101",
            status: "PROBLEM_SELECTED",
          },
        }),
      );
    });

    it("should block selection when problem statements are locked", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "u1",
        participantTeam: { id: "t1" },
      });
      mockPrisma.systemSettings.findUnique.mockResolvedValue({
        key: "problem_statements_locked",
        value: "true",
      });

      await expect(
        teamService.selectProblemStatement("u1", "ps-101"),
      ).rejects.toThrow("Problem statement selection is currently locked");
    });
  });

  describe("Round 1 Project Submissions", () => {
    it("should submit project and advance status to ROUND1_SUBMITTED when both GitHub and PPT are provided", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "u1",
        participantTeam: { id: "t1", status: "PROBLEM_SELECTED" },
      });
      mockPrisma.systemSettings.findUnique.mockResolvedValue({
        key: "round1_locked",
        value: "false",
      });
      mockPrisma.submission.create.mockResolvedValue({
        id: "sub-1",
        githubRepo: "https://github.com/org/repo",
        presentationLink: "https://drive.google.com/presentation",
      });
      mockPrisma.team.update.mockResolvedValue({});

      const result = await teamService.submitProject("u1", {
        githubLink: "https://github.com/org/repo",
        pptLink: "https://drive.google.com/presentation",
      });

      expect(result.id).toBe("sub-1");
      expect(mockPrisma.team.update).toHaveBeenCalledWith({
        where: { id: "t1" },
        data: {
          submissionStatus: "SUBMITTED",
          githubRepo: "https://github.com/org/repo",
          presentationLink: "https://drive.google.com/presentation",
          status: "ROUND1_SUBMITTED",
        },
      });
    });

    it("should set submissionStatus to PARTIAL if only GitHub link is provided", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "u1",
        participantTeam: { id: "t1", status: "PROBLEM_SELECTED" },
      });
      mockPrisma.systemSettings.findUnique.mockResolvedValue(null);
      mockPrisma.submission.create.mockResolvedValue({ id: "sub-2" });
      mockPrisma.team.update.mockResolvedValue({});

      await teamService.submitProject("u1", {
        githubLink: "https://github.com/org/repo",
        pptLink: "",
      });

      expect(mockPrisma.team.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            submissionStatus: "PARTIAL",
            status: "PROBLEM_SELECTED",
          }),
        }),
      );
    });

    it("should reject submission if GitHub link is not valid URL or does not start with https://github.com/", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "u1",
        participantTeam: { id: "t1" },
      });
      mockPrisma.systemSettings.findUnique.mockResolvedValue(null);

      await expect(
        teamService.submitProject("u1", {
          githubLink: "https://gitlab.com/org/repo",
          pptLink: "https://drive.google.com/presentation",
        }),
      ).rejects.toThrow("GitHub link is invalid");
    });

    it("should block project submission when Round 1 is locked", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "u1",
        participantTeam: { id: "t1" },
      });
      mockPrisma.systemSettings.findUnique.mockResolvedValue({
        key: "round1_locked",
        value: "true",
      });

      await expect(
        teamService.submitProject("u1", {
          githubLink: "https://github.com/org/repo",
          pptLink: "https://drive.google.com/presentation",
        }),
      ).rejects.toThrow("Round 1 submissions are currently locked");
    });
  });

  describe("Round 1 Judge-Team Mapping", () => {
    it("should map team to judge with round 1", async () => {
      mockPrisma.evaluation.findUnique.mockResolvedValue(null);
      mockPrisma.evaluation.create.mockResolvedValue({
        id: "eval-1",
        teamId: "t1",
        judgeId: "j1",
        round: 1,
      });

      const result = await superAdminService.mapTeamToJudge("t1", "j1");

      expect(mockPrisma.evaluation.create).toHaveBeenCalledWith({
        data: {
          teamId: "t1",
          judgeId: "j1",
          round: 1,
        },
        include: expect.any(Object),
      });
      expect(result.id).toBe("eval-1");
    });

    it("should reject duplicate mapping for the same team and judge in round 1", async () => {
      mockPrisma.evaluation.findUnique.mockResolvedValue({
        id: "eval-1",
        teamId: "t1",
        judgeId: "j1",
        round: 1,
      });

      await expect(superAdminService.mapTeamToJudge("t1", "j1")).rejects.toThrow(
        "Team is already mapped to this judge",
      );
    });

    it("should remove team-judge mapping for round 1", async () => {
      mockPrisma.evaluation.delete.mockResolvedValue({ id: "eval-1" });

      await superAdminService.removeTeamJudgeMapping("t1", "j1");

      expect(mockPrisma.evaluation.delete).toHaveBeenCalledWith({
        where: {
          teamId_judgeId_round: {
            teamId: "t1",
            judgeId: "j1",
            round: 1,
          },
        },
      });
    });

    it("should toggle Round 1 lock in system settings", async () => {
      mockPrisma.systemSettings.upsert.mockResolvedValue({
        key: "round1_locked",
        value: "true",
      });

      const result = await superAdminService.toggleRound1Lock(true);
      expect(result).toEqual({ locked: true });
      expect(mockPrisma.systemSettings.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: "round1_locked" },
          update: { value: "true" },
        }),
      );
    });
  });

  describe("Round 1 Judging & 5-Criteria Weighted Scoring", () => {
    it("should accurately compute 5-criteria weighted score and complete evaluation", async () => {
      mockPrisma.judge.findUnique.mockResolvedValue({ id: "j1", userId: "u-judge" });
      mockPrisma.evaluation.findUnique.mockResolvedValue({
        id: "eval-1",
        teamId: "t1",
        judgeId: "j1",
        round: 1,
        status: "PENDING",
      });

      // Innovation: 8 * 0.25 = 2.0
      // Technical: 9 * 0.30 = 2.7
      // Presentation: 7 * 0.15 = 1.05
      // Feasibility: 8 * 0.15 = 1.2
      // Impact: 9 * 0.15 = 1.35
      // Total: 8.3
      const scores = {
        innovation: 8,
        technical: 9,
        presentation: 7,
        feasibility: 8,
        impact: 9,
        feedback: "Great initial prototype",
      };

      mockPrisma.teamScore.upsert.mockResolvedValue({
        id: "score-1",
        teamId: "t1",
        judgeId: "j1",
        round: 1,
        totalScore: 8.3,
      });
      mockPrisma.evaluation.update.mockResolvedValue({ id: "eval-1", status: "COMPLETED" });

      const result = await judgeService.submitTeamScore("u-judge", {
        teamId: "t1",
        scores,
        round: 1,
      });

      expect(mockPrisma.teamScore.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            teamId_judgeId_round: {
              teamId: "t1",
              judgeId: "j1",
              round: 1,
            },
          },
          create: expect.objectContaining({
            totalScore: 8.3,
            round: 1,
          }),
        }),
      );

      expect(mockPrisma.evaluation.update).toHaveBeenCalledWith({
        where: { id: "eval-1" },
        data: { status: "COMPLETED" },
      });

      expect(result.totalScore).toBe(8.3);
    });

    it("should throw error if judge attempts to score a team not assigned in Round 1", async () => {
      mockPrisma.judge.findUnique.mockResolvedValue({ id: "j1", userId: "u-judge" });
      mockPrisma.evaluation.findUnique.mockResolvedValue(null);

      await expect(
        judgeService.submitTeamScore("u-judge", {
          teamId: "t-unassigned",
          scores: {
            innovation: 5,
            technical: 5,
            presentation: 5,
            feasibility: 5,
            impact: 5,
          },
          round: 1,
        }),
      ).rejects.toThrow("Team not assigned to this judge");
    });
  });
});
