import { Router } from "express";
import { getCodeforcesProfile } from "../controllers/codeforces.controller.js";

const router = Router();

router.get("/:handle", getCodeforcesProfile);

export default router;
