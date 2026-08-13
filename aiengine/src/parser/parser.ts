import { interviewSchema } from "../types/InterviewResponse.js";
import type { InterviewResponse } from "../types/InterviewResponse.js";

export function parseInterviewResponse(
    response: string
): InterviewResponse {
    try {
        const json = JSON.parse(response);
        return interviewSchema.parse(json);
    }
    catch (err) {
        console.error('failed to parse ai response');
        console.error(err);
        throw new Error("Invalid ai response");
    }
}
