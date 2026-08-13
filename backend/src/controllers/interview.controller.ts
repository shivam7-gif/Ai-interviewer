import type { Request, Response, NextFunction } from "express";
import {
  preInterviewBodySchema,
  sendInterviewMessageSchema,
  evaluateCodeBodySchema,
} from "../types/index.js";
import {
  extractGitHubUsername,
  fetchGitHubRepos,
} from "../services/github.service.js";
import { AIService } from "../services/ai.service.js";
import { prisma } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * POST /api/v1/pre-interview
 * Accepts a GitHub URL, fetches repos, and creates an interview session.
 */
export const createPreInterview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const parsed = preInterviewBodySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { gitHub } = parsed.data;

  try {
    const username = extractGitHubUsername(gitHub);
    const repos = await fetchGitHubRepos(username);

    const interview = await prisma.interView.create({
      data: {
        metaData: {
          githubUrl: gitHub,
          repos: repos as any,
        },
        status: "Pre",
        score: 0,
      },
    });

    res.status(201).json({
      success: true,
      projectId: interview.id,
      repos,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/interview/:id
 * Returns interview session details and previous conversation messages.
 */
export const getInterviewById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const id = req.params.id as string;

  try {
    const interview = await prisma.interView.findUnique({
      where: { id },
      include: {
        conversations: true,
      },
    });

    if (!interview) {
      throw new AppError("Interview session not found", 404);
    }

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/interview/:id/chat
 * Candidate sends a response or question, and AI interviewer evaluates and responds.
 */
export const sendInterviewMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const id = req.params.id as string;
  const parsed = sendInterviewMessageSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { message } = parsed.data;

  try {
    const interview = await prisma.interView.findUnique({
      where: { id },
      include: { conversations: true },
    });

    if (!interview) {
      throw new AppError("Interview session not found", 404);
    }

    // Save candidate user message
    await prisma.message.create({
      data: {
        interviewId: id,
        message,
        type: "User",
      },
    });

    // Construct history for AI context
    const history = interview.conversations.map((msg) => ({
      role: (msg.type === "User" ? "user" : "assistant") as "user" | "assistant",
      content: msg.message,
    }));

    // Invoke AI Agent
    const aiResponse = await AIService.respondToCandidate(history, message);

    // Save AI response message
    await prisma.message.create({
      data: {
        interviewId: id,
        message: aiResponse.reply,
        type: "Assistance",
      },
    });

    // Update session score and status if progressed
    const newScore = Math.round(
      (interview.score +
        (aiResponse.score.correctness +
          aiResponse.score.communication +
          aiResponse.score.confidence) *
          3.33) /
        2
    );

    await prisma.interView.update({
      where: { id },
      data: {
        score: newScore,
        status: aiResponse.interview.isCompleted ? "Done" : "InProgress",
      },
    });

    res.status(200).json({
      success: true,
      data: {
        reply: aiResponse.reply,
        score: aiResponse.score,
        evaluation: aiResponse.evaluation,
        interview: aiResponse.interview,
        totalSessionScore: newScore,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/interview/:id/evaluate-code
 * Evaluates candidate code against problem constraints.
 */
export const evaluateCodeSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const id = req.params.id as string;
  const parsed = evaluateCodeBodySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { code, language, problemTitle } = parsed.data;

  try {
    const interview = await prisma.interView.findUnique({
      where: { id },
    });

    if (!interview) {
      throw new AppError("Interview session not found", 404);
    }

    const evaluation = await AIService.evaluateCode(problemTitle, code, language);

    res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/interview/:id/finish
 * Concludes the interview session.
 */
export const finishInterviewSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const id = req.params.id as string;

  try {
    const interview = await prisma.interView.update({
      where: { id },
      data: { status: "Done" },
      include: { conversations: true },
    });

    res.status(200).json({
      success: true,
      message: "Interview session finalized successfully",
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};
