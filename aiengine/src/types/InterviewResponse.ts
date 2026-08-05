import { z } from "zod";

export const interviewSchema = z.object({
    reply: z.string(),
    score: z.object({
        correctness: z.number(),
        communication: z.number(),
        confidence: z.number()
    }),
    interview: z.object({
        topic: z.string(),
        difficulty: z.string(),
        nextAction: z.string(),
        isCompleted: z.boolean()
    })
});

export type InterviewResponse = z.infer<typeof interviewSchema>;
