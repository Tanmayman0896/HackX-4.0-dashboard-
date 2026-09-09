import {Router, type NextFunction, type Request, type Response} from "express";
import {authService} from "../services/authService";
import type {AuthRequest} from "../middleware/auth";
import {authenticateToken} from "../middleware/auth";
import {logActivity} from "../middleware/logging";

const router = Router();

// Login endpoint
router.post("/login", async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "Authentication failed" });
  }
});

// Change password endpoint
router.post(
  "/change-password",
  authenticateToken,
  logActivity("CHANGE_PASSWORD"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await authService.changePassword(req.user!.id, req.body);
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  },
);

// Reset password endpoint (admin only)
router.post(
  "/reset-password",
  authenticateToken,
  logActivity("RESET_PASSWORD"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user has admin privileges
      if (!["ADMIN", "SUPER_ADMIN"].includes(req.user!.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const { userId } = req.body;
      const newPassword = await authService.resetPassword(req.user, userId);

      res.json({
        message: "Password reset successfully",
        newPassword, // In production, this should be sent via secure channel
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get current user profile
router.get("/profile", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserById(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
