import {Router} from "express";
import {judgeService} from "../services/judgeService";
import type {AuthRequest} from "../middleware/auth";
import {requireJudge} from "../middleware/auth";
import {modifyLimiter} from "../middleware/rateLimiter";
import {logActivity} from "../middleware/logging";

const router = Router();

// Apply judge authentication to all routes
router.use(requireJudge);

// Get judge profile
router.get("/profile", async (req: AuthRequest, res, next) => {
  try {
    const profile = await judgeService.getJudgeProfile(req.user!.id);
    res.json(profile);
  } catch (error: any) {
    next(error)
  }
});

// Get assigned teams
router.get("/teams", async (req: AuthRequest, res, next) => {
  try {
    const roundParam = req.query.round as string | undefined;
    const round =
      roundParam !== undefined && !Number.isNaN(parseInt(roundParam, 10))
        ? parseInt(roundParam, 10)
        : undefined;
    const teams = await judgeService.getAssignedTeams(req.user!.id, round);
    res.json(teams);
  } catch (error: any) {
    next(error)
  }
});

// Get specific team for evaluation
router.get("/teams/:teamId", async (req: AuthRequest, res, next) => {
  try {
    const round = req.query.round ? parseInt(req.query.round as string, 10) : 1;
    const teamData = await judgeService.getTeamForEvaluation(
      req.user!.id,
      req.params.teamId,
      round,
    );
    res.json(teamData);
  } catch (error: any) {
    next(error)
  }
});

// Submit team score
router.post("/score", modifyLimiter, logActivity("SUBMIT_TEAM_SCORE"), async (req: AuthRequest, res, next) => {
  try {
    const score = await judgeService.submitTeamScore(req.user!.id, req.body);
    res.json(score);
  } catch (error: any) {
    next(error)
  }
});

// Get team score
router.get("/teams/:teamId/score", async (req: AuthRequest, res, next) => {
  try {
    const round = req.query.round ? parseInt(req.query.round as string, 10) : 1;
    const score = await judgeService.getTeamScore(req.user!.id, req.params.teamId, round);
    if (!score) {
      return res.json(null);
    }
    res.json(score);
  } catch (error: any) {
    next(error)
  }
});

// Update evaluation status
router.post(
  "/teams/evaluation-status",
  modifyLimiter,
  logActivity("UPDATE_EVALUATION_STATUS"),
  async (req: AuthRequest, res, next) => {
    try {
      const { teamId, status, round } = req.body;
      const evaluation = await judgeService.updateEvaluationStatus(
        req.user!.id,
        teamId,
        status,
        typeof round === "number" ? round : 1,
      );
      res.json(evaluation);
    } catch (error: any) {
      next(error)
    }
  },
);

// Get evaluation history
router.get("/history", async (req: AuthRequest, res, next) => {
  try {
    const history = await judgeService.getEvaluationHistory(req.user!.id);
    res.json(history);
  } catch (error: any) {
    next(error)
  }
});

// Get announcements
router.get("/announcements", async (req: AuthRequest, res, next) => {
  try {
    const announcements = await judgeService.getAnnouncements();
    res.json(announcements);
  } catch (error: any) {
    next(error)
  }
});

export default router;
