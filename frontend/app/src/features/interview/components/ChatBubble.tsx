import React from "react";
import type { ChatMessage } from "../types";

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isAI = message.role === "ai";
  return (
    <div className={`chat-bubble-wrapper ${isAI ? "chat-ai" : "chat-user"}`}>
      {isAI && <div className="chat-sender-label">Sarah</div>}
      {!isAI && <div className="chat-sender-label chat-user-label">You</div>}
      <div className={`chat-bubble ${isAI ? "chat-bubble-ai" : "chat-bubble-user"}`}>
        {message.text}
      </div>
      <div className="chat-timestamp">{formatTime(message.timestamp)}</div>
    </div>
  );
};
