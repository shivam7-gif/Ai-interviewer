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
import {
  fetchCodeforcesProfile,
  codeforcesToText,
  saveCodeforcesProfileToDb,
} from "../services/codeforces.service.js";
import { AIService } from "../services/ai.service.js";
import { prisma } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * POST /api/v1/pre-interview
 * Accepts GitHub URL, Codeforces handle, and/or Resume text to initialize an interview session.
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

  const {
    gitHub,
    codeforcesHandle,
    resumeText,
    resumeWords,
    candidateId,
    questionId,
  } = parsed.data;

  try {
    let username = "candidate";
    let repos: any[] = [];
    let codeforcesProfile: any = null;

    // Auto-detect if gitHub input is actually a Codeforces URL
    const effectiveCfHandle =
      codeforcesHandle ||
      (gitHub && /codeforces\.com/i.test(gitHub) ? gitHub : undefined);
    const effectiveGithub =
      gitHub && !/codeforces\.com/i.test(gitHub) ? gitHub : undefined;

    if (effectiveGithub) {
      try {
        username = extractGitHubUsername(effectiveGithub);
        repos = await fetchGitHubRepos(username);
      } catch (err) {
        console.warn("Could not fetch GitHub repos:", err);
      }
    }

    if (effectiveCfHandle) {
      try {
        codeforcesProfile = await fetchCodeforcesProfile(effectiveCfHandle);
        const cfSummary = codeforcesToText(codeforcesProfile);

        // Console the Codeforces response
        console.log("\n==========================================");
        console.log("=== [Codeforces API Response Fetched] ===");
        console.log("==========================================");
        console.log(JSON.stringify({ profile: codeforcesProfile, summary: cfSummary }, null, 2));

        // Persist to PostgreSQL database
        await saveCodeforcesProfileToDb(codeforcesProfile, cfSummary);
        console.log(`[DB] Successfully stored profile for '${codeforcesProfile.handle}' in PostgreSQL\n`);

        if (username === "candidate") {
          username = codeforcesProfile.handle;
        }
      } catch (err) {
        console.warn("Could not fetch Codeforces profile:", err);
      }
    }

    // Resolve or connectOrCreate candidate
    const sanitizedUsername =
      username.replace(/[^a-zA-Z0-9_.-]/g, "") || "candidate";
    const candidateEmail = `${sanitizedUsername.toLowerCase()}@candidate.interviewos.ai`;

    const candidateConnect = candidateId
      ? { connect: { id: candidateId } }
      : {
          connectOrCreate: {
            where: { email: candidateEmail },
            create: {
              email: candidateEmail,
              name: username,
              role: "Candidate" as const,
            },
          },
        };

    // Resolve question: connect specified, existing, or create a default assessment question
    const existingQuestion = questionId
      ? { id: questionId }
      : await prisma.question.findFirst({ select: { id: true } });

    const questionConnect = existingQuestion
      ? { connect: { id: existingQuestion.id } }
      : {
          connectOrCreate: {
            where: { slug: "system-design-github-assessment" },
            create: {
              slug: "system-design-github-assessment",
              title: "Technical Assessment",
              description:
                "Technical interview assessment based on candidate portfolio and problem solving.",
              difficulty: "Intermediate" as const,
            },
          },
        };

    const interview = await prisma.interview.create({
      data: {
        metaData: {
          githubUrl: gitHub ?? null,
          repos: repos as any,
          codeforces: codeforcesProfile ?? null,
          resume: resumeText
            ? {
                text: resumeText,
                words:
                  resumeWords ?? resumeText.trim().split(/\s+/).length,
              }
            : null,
        },
        status: "Pre",
        score: 0,
        candidate: candidateConnect,
        question: questionConnect,
      },
    });

    const responseData = {
      success: true,
      projectId: interview.id,
      repos,
      codeforces: codeforcesProfile,
      resume: resumeText
        ? { words: resumeWords ?? resumeText.trim().split(/\s+/).length }
        : null,
    };

    console.log("\n=== [Pre-Interview Session Created] ===");
    console.log(JSON.stringify(responseData, null, 2));

    res.status(201).json(responseData);
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
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        messages: true,
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
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { messages: true },
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
    const history = (interview.messages ?? []).map((msg: any) => ({
      role: (msg.type === "User" ? "user" : "assistant") as
        | "user"
        | "assistant",
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

    await prisma.interview.update({
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
    const interview = await prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      throw new AppError("Interview session not found", 404);
    }

    const evaluation = await AIService.evaluateCode(
      problemTitle,
      code,
      language
    );

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
    const interview = await prisma.interview.update({
      where: { id },
      data: { status: "Done" },
      include: { messages: true },
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
