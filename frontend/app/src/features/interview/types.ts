export type Difficulty = "Easy" | "Medium" | "Hard";
export type VoiceState = "idle" | "listening" | "thinking" | "speaking";
export type TabId = "Description" | "Solution" | "Editorial" | "Discussion" | "Submissions";
export type TestTabId = "Test Results" | "Console" | "Output";
export type CameraStatus = "loading" | "live" | "denied" | "error";

export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  text: string;
  timestamp: Date;
}

export interface SampleCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  title: string;
  source: string;
  difficulty: Difficulty;
  acceptance: number;
  companyTags: string[];
  topicTags: string[];
  description: string;
  inputFormat: string[];
  outputFormat: string;
  constraints: string[];
  samples: SampleCase[];
}

export interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  got: string;
  time: string;
  memory: string;
}
