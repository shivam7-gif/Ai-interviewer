import type { Request, Response } from "express";
import { preInterviewBodySchema } from "../types/index.js";
import {
  extractGitHubUsername,
  fetchGitHubRepos,
} from "../services/github.service.js";
import { prisma } from "../config/db.js";

/**
 * POST /api/v1/pre-interview
 * Accepts a GitHub URL, fetches repos, and creates an interview session.
 */
export const createPreInterview = async (
  req: Request,
  res: Response
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
          repos,
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
    console.error("[createPreInterview] Error:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create interview session",
    });
  }
};
