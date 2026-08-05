import Groq from "groq-sdk";
import dotenv from "dotenv";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

// Load environment variables from .env
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
    console.warn("⚠️ Warning: GROQ_API_KEY is not set in your .env file. Please add it to call Groq.");
}

const groqClient = new Groq({
    apiKey: apiKey || "placeholder-key",
});

export async function groq(messages: ChatCompletionMessageParam[]): Promise<string> {
    try {
        const chatCompletion = await groqClient.chat.completions.create({
            messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_completion_tokens: 1024,
        });
        return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("❌ Error calling Groq API:", error);
        return `Error: Failed to fetch response from Groq. Please make sure GROQ_API_KEY is configured correctly.`;
    }
}
