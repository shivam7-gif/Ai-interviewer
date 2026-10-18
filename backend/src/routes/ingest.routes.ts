import { Router } from "express";
import axios from "axios";

const router = Router();
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";

router.post("/resume", async (req, res) => {
  try {
    if (req.body?.text) {
      const text = String(req.body.text).trim();
      return res.json({
        text,
        words: text.split(/\s+/).filter(Boolean).length,
      });
    }

    // Forward stream or body to FastAPI aiengine
    try {
      const response = await axios({
        method: "post",
        url: `${AI_ENGINE_URL}/ingest/resume`,
        data: req,
        headers: {
          "content-type": req.headers["content-type"],
        },
        maxBodyLength: 10 * 1024 * 1024,
      });
      return res.status(response.status).json(response.data);
    } catch (engineErr: any) {
      if (engineErr.response) {
        return res
          .status(engineErr.response.status)
          .json(engineErr.response.data);
      }
      return res.status(502).json({
        error:
          "AI Engine service not available at " +
          AI_ENGINE_URL +
          ". You can paste text or start the aiengine service.",
      });
    }
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to process resume." });
  }
});

export default router;
