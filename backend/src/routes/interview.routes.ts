import { Router } from "express";
import { createPreInterview } from "../controllers/interview.controller.js";

const router = Router();

// POST /api/v1/pre-interview
router.post("/pre-interview", createPreInterview);

export default router;
