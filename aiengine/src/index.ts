import readline from "readline";
import { InterviewAgent } from "./agents/InterviewAgent.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const agent = new InterviewAgent();

console.log("=========================================");
console.log("🎙️  InterviewOS AI Engine - CLI Mode");
console.log("Type your message and press Enter.");
console.log("Type 'exit' or 'quit' to end the session.");
console.log("=========================================\n");

function askQuestion() {
  rl.question("👤 Candidate: ", async (input) => {
    const trimmedInput = input.trim();
    
    if (trimmedInput.toLowerCase() === "exit" || trimmedInput.toLowerCase() === "quit") {
      console.log("\n👋 Exiting AI Engine. Good luck with your preparation!");
      rl.close();
      return;
    }

    if (!trimmedInput) {
      askQuestion();
      return;
    }

    console.log("🤖 Interviewer thinking...");
    const result = await agent.respond(trimmedInput);
    
    console.log("\n🤖 Interviewer:", result.reply);
    console.log("\n📊 Hidden Score");
    console.log(result.score);
    console.log(result.interview);
    console.log("\n");
    
    askQuestion();
  });
}

askQuestion();
