// ── Auth types ────────────────────────────────────────────────────────────────

export interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

// ── Interview types ───────────────────────────────────────────────────────────

export interface GitHubRepo {
  name: string;
  fullName: string;
  description: string | null;
  starcount: number;
}

export interface InterviewSession {
  projectId: string;
  repos: GitHubRepo[];
}

// ── Editor types ──────────────────────────────────────────────────────────────

export interface EditorLanguage {
  name: string;
  monacoId: string;
}
