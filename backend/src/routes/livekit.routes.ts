import { Router } from "express";
import type { Request, Response } from "express";
import { generateLiveKitToken } from "../services/livekit.service.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

/**
 * POST /api/livekit/token
 * Generates a signed LiveKit access token for a participant.
 */
router.post("/token", authLimiter, async (req: Request, res: Response) => {
  const { roomName, identity } = req.body;

  if (!identity) {
    res.status(400).json({ success: false, error: "identity is required" });
    return;
  }
  if (!roomName) {
    res.status(400).json({ success: false, error: "roomName is required" });
    return;
  }

  try {
    const token = await generateLiveKitToken({ roomName, identity });

    res.json({
      success: true,
      token,
      serverUrl: process.env.LIVEKIT_URL,
    });
  } catch (err) {
    console.error("[LiveKit] Token generation failed:", err);
    res.status(500).json({
      success: false,
      error: "Failed to generate token",
    });
  }
});

export default router;
