import { z } from "zod";

// ── Request body schemas ──────────────────────────────────────────────────────

export const preInterviewBodySchema = z.object({
  gitHub: z.string().url("Must be a valid GitHub URL"),
});

export type PreInterviewBody = z.infer<typeof preInterviewBodySchema>;

export const sendInterviewMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

export type SendInterviewMessageBody = z.infer<typeof sendInterviewMessageSchema>;

export const evaluateCodeBodySchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
  language: z.string().default("cpp"),
  problemTitle: z.string().default("Algorithmic Assessment"),
});

export type EvaluateCodeBody = z.infer<typeof evaluateCodeBodySchema>;

// ── GitHub API types ──────────────────────────────────────────────────────────

export interface GitHubRepo {
  description: string | null;
  name: string;
  fullName: string;
  starcount: number;
}

// ── Interview types ───────────────────────────────────────────────────────────

export interface InterviewSession {
  id: string;
  githubUrl: string;
  repos: GitHubRepo[];
  status: "Pre" | "InProgress" | "Done";
  score: number;
}
