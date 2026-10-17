import type { Request, Response } from "express";
import {
  createQuestionSchema,
  listQuestionsQuerySchema,
  updateQuestionSchema,
} from "../Schema/question.schema.js";
import * as questionService from "../services/question.service.js";

export async function createQuestionHandler(req: Request, res: Response) {
  const data = createQuestionSchema.parse(req.body);
  const question = await questionService.createQuestion(data);

  res.status(201).json({
    success: true,
    data: question,
  });
}

export async function listQuestionsHandler(req: Request, res: Response) {
  const query = listQuestionsQuerySchema.parse(req.query);
  const result = await questionService.listQuestions(query);

  res.status(200).json({
    success: true,
    ...result,
  });
}

export async function getQuestionHandler(req: Request, res: Response) {
  const slug = typeof req.params.slug === "string" ? req.params.slug : "";

  if (!slug) {
    res
      .status(400)
      .json({ success: false, message: "Question slug is required" });
    return;
  }

  const question = await questionService.getQuestionBySlug(slug);
  res.status(200).json({
    success: true,
    data: question,
  });
}

export async function updateQuestionHandler(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!id) {
    res
      .status(400)
      .json({ success: false, message: "Question id is required" });
    return;
  }

  const data = updateQuestionSchema.parse(req.body);
  const question = await questionService.updateQuestion(id, data);

  res.status(200).json({
    success: true,
    data: question,
  });
}

export async function deleteQuestionHandler(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!id) {
    res
      .status(400)
      .json({ success: false, message: "Question id is required" });
    return;
  }

  const result = await questionService.deleteQuestion(id);

  res.status(200).json({
    success: true,
    data: result,
  });
}
