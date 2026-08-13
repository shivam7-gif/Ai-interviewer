import { Router } from "express";
import {
  createPreInterview,
  getInterviewById,
  sendInterviewMessage,
  evaluateCodeSubmission,
  finishInterviewSession,
} from "../controllers/interview.controller.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// POST /api/v1/pre-interview - initialize session from GitHub repo
router.post("/pre-interview", createPreInterview);

// GET /api/v1/interview/:id - fetch session details & history
router.get("/interview/:id", getInterviewById);

// POST /api/v1/interview/:id/chat - interactive AI interviewer response
router.post("/interview/:id/chat", aiLimiter, sendInterviewMessage);

// POST /api/v1/interview/:id/evaluate-code - test case & complexity evaluation
router.post("/interview/:id/evaluate-code", aiLimiter, evaluateCodeSubmission);

// POST /api/v1/interview/:id/finish - conclude interview session
router.post("/interview/:id/finish", finishInterviewSession);

export default router;
