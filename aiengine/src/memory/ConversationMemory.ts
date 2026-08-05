import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

export class ConversationMemory {
    private messages: ChatCompletionMessageParam[];
    constructor(systemPrompt: string) {
        this.messages = [
            {
                role: "system",
                content: systemPrompt
            }
        ];
    }
    addUserMessage(message: string){
        this.messages.push({
            role: "user",
            content: message
        });
    }
    addAssistantMessage(message: string){
        this.messages.push({
            role: "assistant",
            content: message
        });
    }
    getMessages(){
        return this.messages;
    }
}
