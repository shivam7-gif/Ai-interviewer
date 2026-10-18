import { z } from "zod";

// ── Request body schemas ──────────────────────────────────────────────────────

export const preInterviewBodySchema = z.object({
  gitHub: z.string().url("Must be a valid GitHub URL").optional(),
  codeforcesHandle: z.string().optional(),
  resumeText: z.string().optional(),
  resumeWords: z.number().optional(),
  candidateId: z.string().uuid().optional(),
  questionId: z.string().uuid().optional(),
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
  githubUrl?: string;
  repos?: GitHubRepo[];
  codeforces?: CodeforcesProfile;
  resume?: { text: string; words: number };
  status: "Pre" | "InProgress" | "Done";
  score: number;
}

// ── Codeforces types ──────────────────────────────────────────────────────────

export interface CodeforcesProfile {
  handle: string;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  solvedRecent: number;
  submissionsAnalysed: number;
  strongTags: string[];
  weakTags: string[];
  fetchedAt: string;
}

export interface CfEnvelope<T> {
  status: "OK" | "FAILED";
  comment?: string;
  result?: T;
}

export interface CfUser {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
}

export interface CfSubmission {
  verdict?: string;
  problem: {
    contestId?: number;
    index: string;
    name: string;
    tags: string[];
  };
}

