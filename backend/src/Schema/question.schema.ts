import { z } from 'zod';

const exampleSchema = z.object({
  id: z.string().uuid().optional(),
  input: z.string().min(1),
  output: z.string().min(1),
  explanation: z.string().optional(),
  orderIndex: z.number().int().optional().default(0),
});

const testCaseSchema = z.object({
  id: z.string().uuid().optional(),
  input: z.string().min(1),
  expectedOutput: z.string().min(1),
  isSample: z.boolean().optional().default(false),
  isHidden: z.boolean().optional().default(true),
});

export const createQuestionSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'lowercase, hyphens only'),
  description: z.string().min(1),
  inputFormat: z.string().optional(),
  outputFormat: z.string().optional(),
  constraints: z.string().optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  playlistId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  companies: z.array(z.string()).optional(),
  orderIndex: z.number().int().optional(),
  examples: z.array(exampleSchema).min(1, 'at least one example required'),
  testCases: z.array(testCaseSchema).min(1, 'at least one test case required'),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const listQuestionsQuerySchema = z.object({
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  tag: z.string().optional(),
  playlistId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ListQuestionsQuery = z.infer<typeof listQuestionsQuerySchema>;