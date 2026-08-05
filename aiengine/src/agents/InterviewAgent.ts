import { groq } from "../llm/groq.js";
import { ConversationMemory } from "../memory/ConversationMemory.js";
import { SYSTEM_PROMPT } from "../prompt/SYSTEMT_PROMPT.js";
import { parseInterviewResponse } from "../parser/parser.js";

export class InterviewAgent {
    private memory: ConversationMemory;
    constructor() {
        this.memory = new ConversationMemory(SYSTEM_PROMPT);
    }
    async respond(userInput: string) {
        this.memory.addUserMessage(userInput);
        const response = await groq(
            this.memory.getMessages()
        );
        const parsed = parseInterviewResponse(response);
        this.memory.addAssistantMessage(parsed.reply);
        
        return parsed;
    }
}