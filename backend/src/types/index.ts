import { z } from "zod";

// ── Request body schemas ──────────────────────────────────────────────────────

export const preInterviewBodySchema = z.object({
  gitHub: z.string().url("Must be a valid GitHub URL"),
});

export type PreInterviewBody = z.infer<typeof preInterviewBodySchema>;

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
