import { Router } from "express";
import { AccessToken } from "livekit-server-sdk";

const router = Router();
router.post("/token", async (req, res) => {
  try {
    const { roomName, identity } = req.body;
    if (!identity) {
      res.status(400).json({ error: "identity is required" });
      return;
    }
    if (!roomName) {
      res.status(400).json({ error: "roomName is required" });
      return;
    }
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity,
      }
    );

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    res.json({
      token,
      serverUrl: process.env.LIVEKIT_URL,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to generate token",
    });
  }
});
export default router;
