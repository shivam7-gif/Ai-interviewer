import { Router } from "express";
import {
  createQuestionHandler,
  deleteQuestionHandler,
  getQuestionHandler,
  listQuestionsHandler,
  updateQuestionHandler,
} from "../controllers/question.controller.js";

const router = Router();

router.get("/", listQuestionsHandler);
router.get("/:slug", getQuestionHandler);
router.post("/", createQuestionHandler);
router.patch("/:id", updateQuestionHandler);
router.delete("/:id", deleteQuestionHandler);

export default router;
